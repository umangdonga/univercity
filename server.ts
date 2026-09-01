import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

// In-memory store for session / oauth states
const authSessions = new Map<string, any>();

// Helper to determine base URL
function getBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol || (host.includes('run.app') ? 'https' : 'http');
  return `${protocol}://${host}`;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    googleOAuthConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    googleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY),
  });
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
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/callback`;

  if (!clientId || clientId === '') {
    return res.status(200).json({
      configured: false,
      redirectUri,
      message: 'GOOGLE_CLIENT_ID is not configured in .env / Settings.',
      fallbackDemoUser: {
        id: 'google-demo-user',
        name: 'Rohit Sharma',
        email: 'rohit.sharma@university.edu',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified_email: true,
      },
    });
  }

  const state = Math.random().toString(36).substring(2, 15);
  const scope = encodeURIComponent('openid profile email');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

  res.json({
    configured: true,
    url: googleAuthUrl,
    redirectUri,
    state,
  });
});

// 3. OAuth Callback handler (Popup target)
app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Error</title></head>
        <body style="font-family: system-ui; text-align: center; padding: 40px; background: #F4F7FB;">
          <h3 style="color: #FF0000;">Authentication Failed</h3>
          <p>${error}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${error}' }, '*');
              setTimeout(() => window.close(), 2000);
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
        <body style="font-family: system-ui; text-align: center; padding: 40px; background: #F4F7FB;">
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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = getBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId || '',
        client_secret: clientSecret || '',
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

    const userPayload = JSON.stringify({
      id: userInfo.id,
      name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
      email: userInfo.email,
      picture: userInfo.picture,
      verified_email: userInfo.verified_email,
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticated - Campus Connect</title>
          <style>
            body { font-family: 'Poppins', system-ui, sans-serif; text-align: center; padding: 48px 20px; background: #F4F7FB; color: #101214; }
            .card { background: white; border-radius: 16px; padding: 24px; max-width: 360px; margin: 0 auto; box-shadow: 0 4px 20px rgba(38,61,136,0.08); }
            .spinner { width: 32px; height: 32px; border: 3px solid #BADDF2; border-top-color: #263D88; border-radius: 50%; animation: spin 1s linear infinite; margin: 16px auto; }
            @keyframes spin { to { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="card">
            <h3 style="color: #263D88; margin: 0 0 8px 0;">Signing in to Campus Connect...</h3>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Welcome, <strong>${userInfo.name || userInfo.email}</strong></p>
            <div class="spinner"></div>
            <p style="font-size: 12px; color: #94a3b8;">This window will close automatically.</p>
          </div>
          <script>
            try {
              const userData = ${userPayload};
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: userData }, '*');
                setTimeout(() => window.close(), 600);
              } else {
                localStorage.setItem('campus_connect_google_user', JSON.stringify(userData));
                window.location.href = '/';
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
        <body style="font-family: system-ui; text-align: center; padding: 40px; background: #F4F7FB;">
          <h3 style="color: #FF0000;">Authentication Error</h3>
          <p>${err.message || 'Unknown error occurred'}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${err.message || 'Auth failed'}' }, '*');
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
