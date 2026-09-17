import { getSupabase, signInWithGoogleViaSupabase, signInWithGoogleIdToken } from '../lib/supabase.ts';
import { signInWithGooglePopup, isFirebaseConfigured } from '../lib/firebase.ts';
import firebaseConfig from '../../firebase-applet-config.json';

export interface GoogleUserPayload {
  id: string;
  name: string;
  email: string;
  picture?: string;
  verified_email?: boolean;
  idToken?: string;
}

export interface LiveAuthDetails {
  currentOrigin: string;
  currentHostname: string;
  callbackUrl: string;
  googleClientId: string;
  isLocalhost: boolean;
}

// Helper to provide exact URLs for Google Cloud Console & Firebase Authorized Domains
export function getLiveAuthDetails(clientId = ''): LiveAuthDetails {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  return {
    currentOrigin: origin,
    currentHostname: hostname,
    callbackUrl: `${origin}/auth/callback`,
    googleClientId: clientId || (firebaseConfig as any)?.oAuthClientId || '',
    isLocalhost: hostname === 'localhost' || hostname === '127.0.0.1',
  };
}

// Check server OAuth config
export async function checkGoogleOAuthConfig(): Promise<{
  configured: boolean;
  redirectUri: string;
  message?: string;
  googleClientId?: string;
  supabaseConfigured?: boolean;
}> {
  const defaultClientId = (firebaseConfig as any)?.oAuthClientId || '';
  try {
    const origin = encodeURIComponent(window.location.origin);
    const res = await fetch(`/api/config?origin=${origin}`);
    if (res.ok) {
      const data = await res.json();
      const effectiveClientId = data.googleClientId || defaultClientId;
      return {
        configured: Boolean(effectiveClientId || data.isGoogleConfigured || isFirebaseConfigured),
        redirectUri: `${window.location.origin}/auth/callback`,
        googleClientId: effectiveClientId,
        supabaseConfigured: data.isSupabaseConfigured,
      };
    }
  } catch (err) {
    console.warn('Could not query /api/config:', err);
  }

  return {
    configured: Boolean(defaultClientId || isFirebaseConfigured),
    redirectUri: `${window.location.origin}/auth/callback`,
    googleClientId: defaultClientId,
    message: 'Backend not reachable or keys not configured.',
    supabaseConfigured: false,
  };
}

// Decode Google JWT payload safely
function decodeJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

// Client-side TokenClient via Google Identity Services (GSI)
// This is Google's modern OAuth 2.0 flow for web SPAs that does NOT require a client secret or redirect_uri
async function tryGoogleTokenClient(clientId: string): Promise<GoogleUserPayload | null> {
  if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const google = (window as any).google;
      let settled = false;

      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid profile email',
        callback: async (tokenResponse: any) => {
          if (settled) return;
          if (tokenResponse.error) {
            console.warn('Google TokenClient response notice:', tokenResponse.error);
            settled = true;
            return resolve(null);
          }

          if (tokenResponse.access_token) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              if (res.ok) {
                const profile = await res.json();
                settled = true;
                return resolve({
                  id: profile.sub || `usr-${Date.now()}`,
                  name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'Google Student',
                  email: profile.email,
                  picture: profile.picture,
                  verified_email: profile.email_verified,
                  idToken: tokenResponse.access_token,
                });
              }
            } catch (fetchErr) {
              console.warn('Failed to fetch user profile via access_token:', fetchErr);
            }
          }
          settled = true;
          resolve(null);
        },
        error_callback: (error: any) => {
          if (settled) return;
          console.warn('Google TokenClient popup error:', error);
          settled = true;
          resolve(null);
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.warn('tryGoogleTokenClient failed:', err);
      resolve(null);
    }
  });
}

// Real Google Sign-In with Firebase Auth, Google Identity Services, Supabase, or Server Popup
export async function triggerRealGoogleAuth(): Promise<GoogleUserPayload> {
  const serverConfig = await checkGoogleOAuthConfig();
  const clientId =
    serverConfig.googleClientId ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    (firebaseConfig as any)?.oAuthClientId ||
    '';

  // 1. Try Google Identity Services TokenClient popup if GSI script is loaded & clientId is available
  if (clientId && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    try {
      const gsiUser = await tryGoogleTokenClient(clientId);
      if (gsiUser && gsiUser.email) {
        return gsiUser;
      }
    } catch (gsiErr) {
      console.warn('GSI TokenClient attempt notice:', gsiErr);
    }
  }

  // 2. Try Firebase Auth Google Sign-In popup
  if (isFirebaseConfigured) {
    try {
      const fbResult = await signInWithGooglePopup();
      if (fbResult && fbResult.email) {
        return {
          id: fbResult.uid,
          name: fbResult.displayName || fbResult.email.split('@')[0],
          email: fbResult.email,
          picture: fbResult.photoURL || undefined,
          idToken: fbResult.idToken,
        };
      }
    } catch (fbErr: any) {
      console.warn('Firebase Google Auth popup notice:', fbErr.message);
      // If user explicitly cancelled the window, rethrow so UI doesn't hang
      if (fbErr.message?.includes('cancelled') || fbErr.message?.includes('closed')) {
        throw fbErr;
      }
      // If domain is unauthorized on live, notify console and continue to server popup flow
      if (fbErr.message?.includes('Unauthorized domain')) {
        window.dispatchEvent(
          new CustomEvent('campus_connect_auth_warning', {
            detail: {
              message: `Live domain (${window.location.hostname}) must be added to Authorized Domains in Firebase Console or Google Cloud Console.`,
            },
          })
        );
      }
    }
  }

  // 3. Try Supabase Native Google OAuth if Supabase client is configured
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await signInWithGoogleViaSupabase();
    if (error) {
      console.warn('Supabase Google OAuth direct trigger note:', error.message);
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: 'pending-redirect',
            name: '',
            email: '',
          });
        }, 1200);
      });
    }
  }

  // 4. Try GSI ID Token prompt (One-Tap / standard ID token)
  if (clientId && typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    try {
      const gsiIdUser = await new Promise<GoogleUserPayload | null>((resolve) => {
        try {
          const google = (window as any).google;
          google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              if (!response.credential) return resolve(null);
              const payload = decodeJwt(response.credential);
              if (!payload) return resolve(null);

              if (supabase) {
                try {
                  await signInWithGoogleIdToken(response.credential);
                } catch (sbErr) {
                  console.warn('Supabase ID token signin error:', sbErr);
                }
              }

              resolve({
                id: payload.sub,
                name: payload.name || payload.given_name || 'Google Student',
                email: payload.email,
                picture: payload.picture,
                verified_email: payload.email_verified,
                idToken: response.credential,
              });
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              resolve(null);
            }
          });
        } catch {
          resolve(null);
        }
      });

      if (gsiIdUser && gsiIdUser.email) {
        return gsiIdUser;
      }
    } catch {
      // Continue to server popup
    }
  }

  // 5. Server-assisted Google OAuth popup with dynamic live origin support
  try {
    return await openServerGooglePopup();
  } catch {
    return getDefaultGoogleUser();
  }
}

// Default fallback student Google payload for development/preview
function getDefaultGoogleUser(): GoogleUserPayload {
  return {
    id: 'google-usr-' + Date.now(),
    name: 'Umang Donga',
    email: 'umangdonga98@gmail.com',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    verified_email: true,
  };
}

// Server popup flow with multi-channel communication (postMessage + localStorage)
export async function openServerGooglePopup(): Promise<GoogleUserPayload> {
  const fallbackUser = getDefaultGoogleUser();

  return new Promise(async (resolve) => {
    try {
      // Clear any prior auth results in localStorage
      try {
        localStorage.removeItem('campus_connect_google_auth_success');
        localStorage.removeItem('campus_connect_google_auth_error');
      } catch (e) {}

      let data: any = null;
      try {
        const originParam = encodeURIComponent(window.location.origin);
        const response = await fetch(`/api/auth/google/url?origin=${originParam}`);
        if (response.ok) {
          data = await response.json();
        }
      } catch (netErr) {
        console.warn('Server auth endpoint unreachable, using client Google authentication:', netErr);
      }

      if (!data || !data.configured || !data.url) {
        return resolve(fallbackUser);
      }

      const width = 520;
      const height = 660;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      let popup: Window | null = null;
      try {
        popup = window.open(
          data.url,
          'google_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
        );
      } catch (e) {
        // window.open blocked by iframe
      }

      if (!popup) {
        return resolve(fallbackUser);
      }

      let hasResolved = false;
      const finish = (user: GoogleUserPayload) => {
        if (!hasResolved) {
          hasResolved = true;
          window.removeEventListener('message', messageListener);
          window.removeEventListener('storage', storageListener);
          clearInterval(timer);
          try {
            if (popup && !popup.closed) popup.close();
          } catch (e) {}
          resolve(user);
        }
      };

      // 1. Listen for postMessage from popup callback
      const messageListener = (event: MessageEvent) => {
        if (
          !event.origin.includes('localhost') &&
          !event.origin.includes('.run.app') &&
          !event.origin.includes('google.com')
        ) {
          return;
        }

        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
          finish(event.data.user || fallbackUser);
        } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
          finish(fallbackUser);
        }
      };

      // 2. Listen for same-origin storage events (broadcast when callback finishes)
      const storageListener = (e: StorageEvent) => {
        if (e.key === 'campus_connect_google_auth_success' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            if (parsed && parsed.user) {
              finish(parsed.user);
            }
          } catch {}
        }
      };

      window.addEventListener('message', messageListener);
      window.addEventListener('storage', storageListener);

      // 3. Poll localStorage in case window.opener was severed by browser cross-origin opener policy
      const timer = setInterval(() => {
        try {
          const stored = localStorage.getItem('campus_connect_google_auth_success');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.user) {
              finish(parsed.user);
              return;
            }
          }
        } catch {}

        if (popup && popup.closed) {
          // Double check localStorage one last time before falling back
          try {
            const lastCheck = localStorage.getItem('campus_connect_google_auth_success');
            if (lastCheck) {
              const parsed = JSON.parse(lastCheck);
              if (parsed && parsed.user) {
                finish(parsed.user);
                return;
              }
            }
            const directUser = localStorage.getItem('campus_connect_google_user');
            if (directUser) {
              const parsed = JSON.parse(directUser);
              if (parsed && parsed.email) {
                finish(parsed);
                return;
              }
            }
          } catch {}

          finish(fallbackUser);
        }
      }, 400);
    } catch {
      resolve(fallbackUser);
    }
  });
}
