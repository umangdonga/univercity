import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';

// Configuration state
let supabaseClient: SupabaseClient | null = null;
let supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://vldzpmsasqawuzpxptpb.supabase.co',
  anonKey:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    (typeof window !== 'undefined' ? localStorage.getItem('campus_connect_supabase_key') || '' : ''),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};

// Save Supabase credentials directly from UI or chat
export async function saveSupabaseClientConfig(anonKey: string, url?: string): Promise<boolean> {
  const finalUrl = (url && url.trim()) || 'https://vldzpmsasqawuzpxptpb.supabase.co';
  const cleanKey = anonKey.trim();
  supabaseConfig.url = finalUrl;
  supabaseConfig.anonKey = cleanKey;

  if (typeof window !== 'undefined') {
    localStorage.setItem('campus_connect_supabase_key', cleanKey);
    localStorage.setItem('campus_connect_supabase_url', finalUrl);
  }

  supabaseClient = null;

  try {
    await fetch('/api/config/supabase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonKey: cleanKey, url: finalUrl }),
    });
  } catch (e) {
    console.warn('Could not persist to /api/config/supabase:', e);
  }

  const result = await initSupabaseConfig();
  return result.isConfigured;
}

// Initialize or fetch Supabase client lazily
export async function initSupabaseConfig(): Promise<{
  isConfigured: boolean;
  url: string;
  hasGoogleClientId: boolean;
}> {
  // If not in client env, try fetching public config from server
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.supabaseUrl && data.supabaseAnonKey) {
          supabaseConfig.url = data.supabaseUrl;
          supabaseConfig.anonKey = data.supabaseAnonKey;
        }
        if (data.googleClientId) {
          supabaseConfig.googleClientId = data.googleClientId;
        }
      }
    } catch (e) {
      console.warn('Could not fetch /api/config:', e);
    }
  }

  if (supabaseConfig.url && supabaseConfig.anonKey && !supabaseClient) {
    try {
      supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }

  return {
    isConfigured: Boolean(supabaseClient),
    url: supabaseConfig.url,
    hasGoogleClientId: Boolean(supabaseConfig.googleClientId),
  };
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;
  if (supabaseConfig.url && supabaseConfig.anonKey) {
    try {
      supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseClient;
    } catch (err) {
      console.error('Error creating Supabase client:', err);
      return null;
    }
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabase());
}

export function getGoogleClientId(): string {
  return supabaseConfig.googleClientId;
}

// 1. Real Google Authentication via Supabase OAuth
export async function signInWithGoogleViaSupabase(): Promise<{ error: Error | null }> {
  const client = getSupabase();
  if (!client) {
    return {
      error: new Error(
        'Supabase is not configured yet. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Settings.'
      ),
    };
  }

  try {
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
}

// 2. Real Google Sign In via Google ID Token (Google Identity Services)
export async function signInWithGoogleIdToken(idToken: string): Promise<{
  data: { user: SupabaseUser | null; session: Session | null } | null;
  error: Error | null;
}> {
  const client = getSupabase();
  if (!client) {
    return {
      data: null,
      error: new Error('Supabase client is not configured.'),
    };
  }

  try {
    const { data, error } = await client.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

// 3. Save / Upsert Student Profile into Supabase Database
export interface StudentRecord {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  student_id?: string;
  degree?: string;
  semester?: string;
  department?: string;
  emergency_contact?: string;
  profile_completed?: boolean;
  bus_data?: any;
  updated_at?: string;
}

export async function saveStudentToSupabase(student: StudentRecord): Promise<{
  success: boolean;
  error: string | null;
}> {
  const client = getSupabase();

  // Try direct Supabase client write
  if (client) {
    try {
      const payload = {
        id: student.id,
        email: student.email,
        name: student.name,
        avatar: student.avatar || '',
        student_id: student.student_id || '',
        degree: student.degree || '',
        semester: student.semester || '',
        department: student.department || '',
        emergency_contact: student.emergency_contact || '',
        profile_completed: student.profile_completed ?? false,
        bus_data: student.bus_data || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await client.from('students').upsert(payload, {
        onConflict: 'id',
      });

      if (error) {
        console.warn('Supabase direct upsert note:', error.message);
        // Fall back to server sync endpoint
      } else {
        return { success: true, error: null };
      }
    } catch (e: any) {
      console.warn('Supabase client error:', e);
    }
  }

  // Also sync via server-side proxy which handles table creation or service role key
  try {
    const res = await fetch('/api/students/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    const data = await res.json();
    return { success: data.success ?? true, error: data.error || null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 4. Fetch Student Profile from Supabase Database
export async function fetchStudentFromSupabase(userId: string): Promise<StudentRecord | null> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('students')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        return data as StudentRecord;
      }
    } catch (e) {
      console.warn('Error fetching from Supabase directly:', e);
    }
  }

  // Fallback to server endpoint
  try {
    const res = await fetch(`/api/students/${encodeURIComponent(userId)}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('Error fetching from /api/students:', e);
  }

  return null;
}
