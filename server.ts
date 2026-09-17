import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { upsertStudentInPostgres, getStudentFromPostgres } from './src/db/users.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Trust reverse proxies (Cloud Run / Nginx) for accurate protocol and host headers
app.set('trust proxy', true);

app.use(express.json());

// Safely load firebase-applet-config.json for default OAuth client ID if not in env
let firebaseAppletConfig: any = null;
try {
  const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(cfgPath)) {
    firebaseAppletConfig = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
  }
} catch {
  // Ignore
}

// Lazy-initialize Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Lazy-initialize Supabase Server Client
let supabaseServerClient: SupabaseClient | null = null;
function getSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  if (!supabaseServerClient) {
    try {
      supabaseServerClient = createClient(supabaseUrl, supabaseKey);
    } catch (e) {
      console.warn('Failed to initialize server Supabase client:', e);
      return null;
    }
  }
  return supabaseServerClient;
}

// In-memory store for session / oauth states and user profiles
const authSessions = new Map<string, any>();
const userDatabase = new Map<string, any>();

// Helper to determine base URL dynamically with live proxy and client origin support
function getBaseUrl(req: express.Request): string {
  // 1. If client provided its browser origin explicitly, prioritize it for matching
  const queryOrigin = req.query.origin as string;
  if (queryOrigin && typeof queryOrigin === 'string' && (queryOrigin.includes('localhost') || queryOrigin.includes('.run.app'))) {
    return queryOrigin.replace(/\/$/, '');
  }
  // 2. Check client origin header
  const headerOrigin = req.get('origin');
  if (headerOrigin && (headerOrigin.includes('localhost') || headerOrigin.includes('.run.app'))) {
    return headerOrigin.replace(/\/$/, '');
  }
  // 3. Check proxy headers
  const fHost = (req.headers['x-forwarded-host'] as string) || req.get('host');
  const fProto = (req.headers['x-forwarded-proto'] as string) || (fHost && fHost.includes('localhost') ? 'http' : 'https');
  if (fHost) {
    return `${fProto}://${fHost}`;
  }
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

// 1. Health check
app.get('/api/health', (req, res) => {
  const supabase = getSupabaseServerClient();
  const cloudSqlConfigured = Boolean(process.env.SQL_HOST && process.env.SQL_DB_NAME);
  const googleClientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    firebaseAppletConfig?.oAuthClientId ||
    '';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cloudSqlConfigured,
    supabaseConfigured: Boolean(supabase),
    googleOAuthConfigured: Boolean(googleClientId),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    usersCount: userDatabase.size,
  });
});

// Configuration endpoint for client (safe public values)
app.get('/api/config', (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const googleClientId =
    process.env.VITE_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    firebaseAppletConfig?.oAuthClientId ||
    '';
  const cloudSqlConfigured = Boolean(process.env.SQL_HOST && process.env.SQL_DB_NAME);

  res.json({
    supabaseUrl,
    supabaseAnonKey,
    googleClientId,
    cloudSqlConfigured,
    isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
    isGoogleConfigured: Boolean(googleClientId),
    appUrl: getBaseUrl(req),
    liveOrigin: getBaseUrl(req),
    callbackUrl: `${getBaseUrl(req)}/auth/callback`,
  });
});

// Student & User Sync API Endpoint - writes to Cloud SQL (PostgreSQL) and Supabase
app.post('/api/students/sync', async (req, res) => {
  const student = req.body;
  if (!student || (!student.id && !student.email)) {
    return res.status(400).json({ error: 'Student identifier (id or email) is required' });
  }

  const userId = student.id || `student-${student.email}`;
  const existing = userDatabase.get(userId) || {};
  const updated = {
    ...existing,
    ...student,
    id: userId,
    updatedAt: new Date().toISOString(),
  };

  userDatabase.set(userId, updated);

  // 1. Save to Cloud SQL PostgreSQL
  let postgresSaved = false;
  let postgresError = null;
  try {
    await upsertStudentInPostgres({
      id: userId,
      uid: userId,
      email: updated.email,
      name: updated.name || 'Campus Student',
      avatar: updated.avatar || updated.photo || '',
      studentId: updated.student_id || updated.studentId || '',
      degree: updated.degree || '',
      semester: updated.semester || '',
      department: updated.department || '',
      emergencyContact: updated.emergency_contact || updated.emergencyContact || '',
      profileCompleted: Boolean(updated.profile_completed ?? updated.profileCompleted),
      busData: updated.bus_data || updated.busData || null,
    });
    postgresSaved = true;
  } catch (pgErr: any) {
    console.warn('PostgreSQL student sync notice:', pgErr.message);
    postgresError = pgErr.message;
  }

  // 2. Save to Supabase if configured
  const supabase = getSupabaseServerClient();
  let supabaseSaved = false;
  let supabaseError = null;

  if (supabase) {
    try {
      const { error } = await supabase.from('students').upsert(
        {
          id: userId,
          email: updated.email,
          name: updated.name || 'Campus Student',
          avatar: updated.avatar || updated.photo || '',
          student_id: updated.student_id || updated.studentId || '',
          degree: updated.degree || '',
          semester: updated.semester || '',
          department: updated.department || '',
          emergency_contact: updated.emergency_contact || updated.emergencyContact || '',
          profile_completed: Boolean(updated.profile_completed ?? updated.profileCompleted),
          bus_data: updated.bus_data || updated.busData || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.warn('Supabase student sync warning:', error.message);
        supabaseError = error.message;
      } else {
        supabaseSaved = true;
      }
    } catch (err: any) {
      console.warn('Supabase sync exception:', err);
      supabaseError = err.message;
    }
  }

  res.json({
    success: true,
    postgresSaved,
    postgresError,
    supabaseSaved,
    supabaseConfigured: Boolean(supabase),
    supabaseError,
    student: updated,
  });
});

// Fetch student profile endpoint (queries Cloud SQL first, then Supabase, then memory)
app.get('/api/students/:id', async (req, res) => {
  const { id } = req.params;

  // Try Cloud SQL PostgreSQL
  try {
    const pgStudent = await getStudentFromPostgres(id);
    if (pgStudent) {
      return res.json(pgStudent);
    }
  } catch (pgErr) {
    console.warn('Error querying Postgres student:', pgErr);
  }

  // Try Supabase
  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Error querying Supabase student:', e);
    }
  }

  const local = userDatabase.get(id);
  if (local) {
    return res.json(local);
  }
  res.status(404).json({ error: 'Student not found' });
});

// Legacy user sync route
app.post('/api/users/sync', async (req, res) => {
  const { uid, name, email, photoURL, role } = req.body;
  if (!uid && !email) {
    return res.status(400).json({ error: 'User identifier (uid or email) is required' });
  }

  const userId = uid || `usr-${email}`;
  const existing = userDatabase.get(userId) || {};
  const updated = {
    ...existing,
    uid: userId,
    id: userId,
    name: name || existing.name || 'Campus Student',
    email: email || existing.email,
    photoURL: photoURL || existing.photoURL,
    avatar: photoURL || existing.avatar,
    role: role || existing.role || 'student',
    lastLoginAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  userDatabase.set(userId, updated);

  const supabase = getSupabaseServerClient();
  if (supabase) {
    try {
      await supabase.from('students').upsert(
        {
          id: userId,
          email: updated.email,
          name: updated.name,
          avatar: updated.photoURL || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (e) {
      console.warn('Supabase sync in legacy endpoint:', e);
    }
  }

  res.json({ success: true, user: updated });
});

// User Fetch Profile API Endpoint
app.get('/api/users/:id', (req, res) => {
  const user = userDatabase.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Google Maps Config Endpoint
app.get('/api/maps/config', (req, res) => {
  res.json({
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    defaultCenter: { lat: 12.9716, lng: 77.5946 }, // University Campus coordinates
    zoom: 17,
  });
});

// 2. Campus AI Chatbot Endpoint with Gemini 3.7 Flash
app.post('/api/ai/chat', async (req, res) => {
  const { message, history = [], userRole = 'student' } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const campusSystemPrompt = `You are "CampusAI", the intelligent, friendly, and hyper-accurate smart campus assistant for the Campus Connect University Platform.
Current User Role: ${userRole}.

CAMPUS KNOWLEDGE BASE:
1. BUILDINGS & ROOMS:
   - Main Academic Building: Ground Floor (Student Affairs, Admin Office, Dean Office), 1st Floor (Computer Lab 101-104), 2nd Floor (Lecture Hall A-1, A-2), 3rd Floor (Classroom B 304, Seminar Hall).
   - Science Block B: 3rd Floor houses Classroom B 304 and the AI/Robotics Innovation Lab.
   - Knowledge Tower: Houses Central Library (2nd & 3rd floors, 50,000+ books, 24/7 quiet study cubicles, RFID kiosk), Conference Center.
   - Canteen Complex: Near Sports Arena & North Gate.
   - Hostels: Boys Hostel Block A (Warden: Dr. R. Verma, +1-555-0199) & Girls Hostel Block B (Warden: Dr. S. Rao, +1-555-0198). Curfew: 9:30 PM.
   - Parking: North Gate Ground Lot (6 slots currently vacant, EV chargers available).
   - Sports Complex: Olympic size swimming pool, basketball court, indoor badminton.

2. FOOD & DINING:
   - S Y Cafe: Ground floor Canteen Complex. Open 8:00 AM - 9:00 PM. Known for artisan espresso, fresh avocado toast ($4.50), South Indian crispy masala dosa ($3.80), and fresh fruit smoothies.
   - UNIQUE Canteen: Open 7:30 AM - 10:00 PM. High-speed meal thali, chicken/paneer rolls, pasta, and snacks.

3. BUS & TRANSPORT:
   - Route 1: North City Express via Ring Road. Bus #12 (KA-01-F-8821). Next departure in 8 mins from Gate A.
   - Route 4: Tech Park & Metro Hub Shuttle. Every 15 mins.
   - Digital Bus Pass: Students can register instantly via the Bus Service page.

4. ACADEMICS & ADMISSIONS:
   - Programs: BCA, B.Tech CS/AI, M.Des (Master of Design), MBA, Data Science.
   - Admission Counseling: Inquiries & official campus tour passes can be booked in the Admission Inquiry section.

5. LIBRARY POLICIES:
   - Standard checkout: 14 days for students, 30 days for faculty. Fine is $0.50/day after due date. Instant renewals available via the Library screen.

FORMATTING RULES:
- Keep answers concise, clear, and easy to read on mobile.
- Use bullet points and bold highlights.
- Suggest 1 to 3 helpful short follow-up action chips when relevant (e.g., "Navigate to B 304", "Open Canteen Menu", "View Bus Schedule", "Book Admission Pass", "Renew Book").`;

  try {
    const ai = getGeminiClient();
    if (ai) {
      // Use official @google/genai format
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${campusSystemPrompt}\n\nUser Conversation Context:\n${(history || [])
                  .map((h: any) => `${h.role}: ${h.text}`)
                  .join('\n')}\n\nUser: ${message}`,
              },
            ],
          },
        ],
      });

      const responseText = response.text || 'I am ready to help you navigate campus life. How else can I assist you?';

      // Parse suggestions
      const suggestions: string[] = [];
      if (message.toLowerCase().includes('b 304') || message.toLowerCase().includes('class') || message.toLowerCase().includes('navigate') || message.toLowerCase().includes('where')) {
        suggestions.push('Navigate to B 304', 'View 3D Campus Map');
      }
      if (message.toLowerCase().includes('canteen') || message.toLowerCase().includes('food') || message.toLowerCase().includes('eat') || message.toLowerCase().includes('cafe')) {
        suggestions.push('Open S Y Cafe Menu', 'Check Dining Reviews');
      }
      if (message.toLowerCase().includes('bus') || message.toLowerCase().includes('transport') || message.toLowerCase().includes('route')) {
        suggestions.push('View Bus Timings', 'Get Digital Bus Pass');
      }
      if (message.toLowerCase().includes('library') || message.toLowerCase().includes('book')) {
        suggestions.push('Open Library', 'Check Overdue Books');
      }
      if (suggestions.length === 0) {
        suggestions.push('Campus 3D Map', 'Canteen Menus', 'Bus Timings');
      }

      return res.json({
        reply: responseText,
        source: 'gemini-3.7-flash',
        suggestions: suggestions.slice(0, 3),
      });
    }
  } catch (err: any) {
    console.warn('Gemini API call failed, falling back to smart local knowledge engine:', err.message);
  }

  // Smart Contextual Knowledge Fallback
  const q = message.toLowerCase();
  let reply = '';
  let suggestions: string[] = ['Campus 3D Map', 'Canteen Menus', 'Bus Timings'];

  if (q.includes('b 304') || q.includes('b304') || q.includes('classroom') || (q.includes('where') && q.includes('class'))) {
    reply = `📍 **Classroom B 304** is located in **Science Block B** on the **3rd Floor (East Wing)**.\n\n• **Walking time:** ~3 mins (140m from Main Entrance)\n• **Equipment:** Smart 4K Projector, Hybrid Audio, AC\n• **Current Status:** Advanced Algorithms lecture scheduled at 11:00 AM.\n\nTap below to start real-time turn-by-turn navigation!`;
    suggestions = ['Navigate to B 304', 'View Science Block B', 'Show Floor Plan'];
  } else if (q.includes('canteen') || q.includes('food') || q.includes('cafe') || q.includes('lunch') || q.includes('eat') || q.includes('sy cafe')) {
    reply = `🍽️ **Campus Dining Overview:**\n\n1. **S Y Cafe (Ground Floor Canteen Complex):**\n   • Popular for: Artisan Espresso ($2.50), Crispy Masala Dosa ($3.80), Avocado Toast ($4.50).\n   • Rating: 4.8 ⭐ (140+ reviews)\n   • Timings: 8:00 AM – 9:00 PM\n\n2. **UNIQUE Canteen:**\n   • Hot Meal Thali ($5.00), Chicken/Paneer Kathi Rolls.\n   • Timings: 7:30 AM – 10:00 PM`;
    suggestions = ['Open S Y Cafe Menu', 'View UNIQUE Canteen', 'Rate Canteen'];
  } else if (q.includes('bus') || q.includes('route') || q.includes('shuttle') || q.includes('timing') || q.includes('transport')) {
    reply = `🚌 **Live Campus Bus Status:**\n\n• **Route 1 (North City Express):** Bus #12 departing from Gate A in **8 minutes** (14 seats available).\n• **Route 4 (Metro Hub Shuttle):** Next trip in **15 minutes**.\n• **Digital Bus Pass:** You can verify and show your student QR bus pass directly on your phone.`;
    suggestions = ['View Bus Schedules', 'Show Bus Pass', 'Live Route Tracking'];
  } else if (q.includes('library') || q.includes('book') || q.includes('fine') || q.includes('due') || q.includes('knowledge tower')) {
    reply = `📚 **Knowledge Tower Central Library:**\n\n• **Location:** 2nd & 3rd Floor, Knowledge Tower\n• **Timings:** 8:00 AM – 11:00 PM (Reading cubicles open 24/7 during exam weeks)\n• **Loan Policy:** 14 days per book. Fine for overdue items is $0.50/day.\n• You can renew your issued books or clear overdue notices in 1 tap.`;
    suggestions = ['Open Library Books', 'Renew Issued Books', 'Search Catalog'];
  } else if (q.includes('hostel') || q.includes('room') || q.includes('warden') || q.includes('curfew')) {
    reply = `🏢 **Hostel & Residence Desk:**\n\n• **Boys Hostel (Block A):** Warden Dr. R. Verma (+1-555-0199)\n• **Girls Hostel (Block B):** Warden Dr. S. Rao (+1-555-0198)\n• **Curfew:** 9:30 PM (Biometric entry logs)\n• **Amenities:** High-speed Wi-Fi, laundry facilities, study lounges, 24/7 power backup.`;
    suggestions = ['View Hostel Blocks', 'Contact Warden', 'Hostel Rules'];
  } else if (q.includes('admission') || q.includes('tour') || q.includes('appointment') || q.includes('counseling') || q.includes('course')) {
    reply = `🎓 **Admissions & Counseling Office:**\n\n• **Location:** Ground Floor, Admin Block (Gate B)\n• **Hours:** Mon–Sat 9:00 AM – 5:00 PM\n• **Available Programs:** BCA, B.Tech (CS, AI & Data Science), M.Des, MBA.\n• You can book a priority 1-on-1 counseling slot and download your official visitor gate pass.`;
    suggestions = ['Book Counseling Tour', 'View Course Catalog', 'Admission Pass'];
  } else if (q.includes('parking') || q.includes('car') || q.includes('slot')) {
    reply = `🚗 **Parking Availability:**\n\n• **North Gate Smart Parking:** **6 Vacant General Slots** available right now.\n• **EV Charging:** 2 fast DC chargers active on Row B.\n• **Faculty Reserved:** Green zone near Block A.`;
    suggestions = ['View Parking Map', 'Navigate to North Gate'];
  } else if (q.includes('sos') || q.includes('help') || q.includes('emergency') || q.includes('security') || q.includes('contact')) {
    reply = `🚨 **Emergency & Campus Support:**\n\n• **24/7 Security Control Room:** +1 (555) 911-CAMP\n• **Medical Health Center:** Ground Floor, Science Block B\n• **Student Grievance Desk:** support@university.edu\n\nTap the button below for immediate SOS assistance.`;
    suggestions = ['Emergency SOS', 'Call Security', 'Help Center'];
  } else {
    reply = `👋 Hello! I am your **CampusAI Assistant**.\n\nI can help you with:\n• 🗺️ **Turn-by-turn Navigation** to any classroom, lab, or office\n• 🍔 **Canteen Menus & Dining Reviews** (S Y Cafe & UNIQUE)\n• 🚌 **Live Bus Schedules & Digital Bus Pass**\n• 📚 **Library Books & Overdue Clearance**\n• 🏢 **Hostel Room Allotments & Rules**\n• 🎓 **Course Catalogs & Admission Appointments**\n\nHow can I help you today?`;
    suggestions = ['Navigate to Classroom', 'Check Canteen Today', 'Bus Timings', 'Library Books'];
  }

  res.json({
    reply,
    source: 'campus-knowledge-engine',
    suggestions,
  });
});

// 2. Google OAuth URL generator
app.get('/api/auth/google/url', (req, res) => {
  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    firebaseAppletConfig?.oAuthClientId ||
    '';
  const origin = ((req.query.origin as string) || getBaseUrl(req)).replace(/\/$/, '');
  const redirectUri = `${origin}/auth/callback`;

  if (!clientId || clientId === '') {
    return res.status(200).json({
      configured: false,
      redirectUri,
      message: 'GOOGLE_CLIENT_ID is not configured in .env / Settings.',
    });
  }

  // Pack origin & redirectUri into state so callback can reliably decode the exact redirectUri used
  const stateData = {
    nonce: Math.random().toString(36).substring(2, 15),
    redirectUri,
    origin,
  };
  const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');
  const scope = encodeURIComponent('openid profile email');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account&state=${state}`;

  res.json({
    configured: true,
    url: googleAuthUrl,
    redirectUri,
    origin,
    state,
  });
});

// 3. OAuth Callback handler (Popup target)
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, state, error } = req.query;

  let redirectUri = `${getBaseUrl(req)}/auth/callback`;
  let clientOrigin = getBaseUrl(req);

  if (state && typeof state === 'string') {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      if (decoded.redirectUri) redirectUri = decoded.redirectUri;
      if (decoded.origin) clientOrigin = decoded.origin;
    } catch {
      // Ignore
    }
  }

  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="font-family: system-ui, sans-serif; text-align: center; padding: 40px; background: #F4F7FB;">
          <h3 style="color: #dc2626; margin-bottom: 8px;">Google Sign-In Cancelled or Denied</h3>
          <p style="color: #64748b; font-size: 14px;">${error}</p>
          <script>
            try {
              localStorage.setItem('campus_connect_google_auth_error', '${error}');
            } catch (e) {}
            if (window.opener) {
              try {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${error}' }, '*');
              } catch (e) {}
              setTimeout(() => window.close(), 1500);
            }
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Campus Connect - Auth Callback</title></head>
        <body style="font-family: system-ui, sans-serif; text-align: center; padding: 40px; background: #F4F7FB;">
          <h3>No authorization code received</h3>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: 'No code received' }, '*');
              setTimeout(() => window.close(), 1500);
            }
          </script>
        </body>
      </html>
    `);
  }

  try {
    const clientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.VITE_GOOGLE_CLIENT_ID ||
      firebaseAppletConfig?.oAuthClientId ||
      '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange token');
    }

    // Fetch user profile from Google UserInfo endpoint
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = await userInfoResponse.json();

    const studentRecord = {
      id: `usr-${userInfo.id}`,
      name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim() || 'Google Student',
      email: userInfo.email,
      picture: userInfo.picture,
      verified_email: userInfo.verified_email,
    };

    // Save student profile to Cloud SQL Postgres
    try {
      await upsertStudentInPostgres({
        id: studentRecord.id,
        uid: studentRecord.id,
        email: studentRecord.email,
        name: studentRecord.name,
        avatar: studentRecord.picture || '',
        profileCompleted: true,
      });
    } catch (pgErr) {
      console.warn('Cloud SQL Postgres save in oauth callback error:', pgErr);
    }

    // Save student profile directly to Supabase
    const supabase = getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from('students').upsert(
          {
            id: studentRecord.id,
            email: studentRecord.email,
            name: studentRecord.name,
            avatar: studentRecord.picture || '',
            profile_completed: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );
      } catch (dbErr) {
        console.warn('Supabase save in oauth callback error:', dbErr);
      }
    }

    const userPayload = JSON.stringify(studentRecord);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticated - Campus Connect</title>
          <style>
            body { font-family: 'Poppins', system-ui, sans-serif; text-align: center; padding: 48px 20px; background: #F4F7FB; color: #101214; }
            .card { background: white; border-radius: 20px; padding: 32px 24px; max-width: 380px; margin: 0 auto; box-shadow: 0 10px 30px rgba(38,61,136,0.1); border: 1px solid #e2e8f0; }
            .spinner { width: 36px; height: 36px; border: 3px solid #BADDF2; border-top-color: #263D88; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto; }
            .btn { display: inline-block; margin-top: 16px; padding: 10px 20px; background: #263D88; color: white; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <h3 style="color: #263D88; margin: 0 0 8px 0; font-size: 18px;">Signed In with Google!</h3>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Welcome, <strong>${userInfo.name || userInfo.email}</strong></p>
            <div class="spinner"></div>
            <p style="font-size: 12px; color: #94a3b8;">Returning to Campus Connect...</p>
            <button class="btn" onclick="window.close()">Close Window</button>
          </div>
          <script>
            try {
              const userData = ${userPayload};
              // 1. Broadcast via localStorage for robust same-origin communication
              try {
                localStorage.setItem('campus_connect_google_auth_success', JSON.stringify({
                  user: userData,
                  timestamp: Date.now()
                }));
                localStorage.setItem('campus_connect_google_user', JSON.stringify(userData));
              } catch (e) {}

              // 2. Broadcast via window.opener postMessage
              if (window.opener) {
                try { window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: userData }, '*'); } catch (e) {}
                try { window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: userData }, '${clientOrigin}'); } catch (e) {}
                setTimeout(() => window.close(), 700);
              }
            } catch (e) {
              console.error(e);
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('OAuth Callback error:', err);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="font-family: system-ui, sans-serif; text-align: center; padding: 40px; background: #F4F7FB;">
          <h3 style="color: #dc2626;">Authentication Notice</h3>
          <p style="color: #475569; font-size: 14px;">${err.message || 'OAuth token exchange was not completed.'}</p>
          <p style="color: #94a3b8; font-size: 12px; max-width: 360px; margin: 12px auto;">
            Ensure GOOGLE_CLIENT_SECRET is configured in Settings and that Authorized redirect URIs include:
            <br/><code>${redirectUri}</code>
          </p>
          <script>
            try {
              localStorage.setItem('campus_connect_google_auth_error', '${(err.message || '').replace(/'/g, "\\'")}');
            } catch (e) {}
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${(err.message || 'Auth failed').replace(/'/g, "\\'")}' }, '*');
              setTimeout(() => window.close(), 3000);
            }
          </script>
        </body>
      </html>
    `);
  }
});

// Setup Vite or static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Connect Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
