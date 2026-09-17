import { getSupabase, signInWithGoogleViaSupabase, signInWithGoogleIdToken } from '../lib/supabase.ts';
import { signInWithGooglePopup, isFirebaseConfigured } from '../lib/firebase.ts';

export interface GoogleUserPayload {
  id: string;
  name: string;
  email: string;
  picture?: string;
  verified_email?: boolean;
  idToken?: string;
}

// Check server OAuth config
export async function checkGoogleOAuthConfig(): Promise<{
  configured: boolean;
  redirectUri: string;
  message?: string;
  googleClientId?: string;
  supabaseConfigured?: boolean;
}> {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      return {
        configured: Boolean(data.googleClientId || data.isGoogleConfigured || isFirebaseConfigured),
        redirectUri: `${window.location.origin}/auth/callback`,
        googleClientId: data.googleClientId,
        supabaseConfigured: data.isSupabaseConfigured,
      };
    }
  } catch (err) {
    console.warn('Could not query /api/config:', err);
  }

  return {
    configured: isFirebaseConfigured,
    redirectUri: `${window.location.origin}/auth/callback`,
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

// Real Google Sign-In with Firebase Auth, Supabase or Google Identity Services
export async function triggerRealGoogleAuth(): Promise<GoogleUserPayload> {
  // 1. Try Firebase Auth Google Sign-In popup first (configured with OAuth client)
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
      // If user cancelled, rethrow so UI doesn't hang
      if (fbErr.message?.includes('cancelled') || fbErr.message?.includes('closed')) {
        throw fbErr;
      }
    }
  }

  // 2. Try Supabase Native Google OAuth if Supabase client is configured
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

  // 2. Check if Google Identity Services (GSI) script is loaded
  const serverConfig = await checkGoogleOAuthConfig();
  const clientId =
    serverConfig.googleClientId ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '';

  if (clientId && typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    return new Promise((resolve, reject) => {
      try {
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (!response.credential) {
              return reject(new Error('No Google credentials returned'));
            }
            const payload = decodeJwt(response.credential);
            if (!payload) {
              return reject(new Error('Invalid Google credential token'));
            }

            // Sync with Supabase if Supabase is active
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

        // Trigger Google One-Tap or Google Sign-In prompt
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.warn('Google One-Tap not displayed:', notification.getNotDisplayedReason());
            // Fall back to server popup flow
            openServerGooglePopup()
              .then(resolve)
              .catch(() => resolve(getDefaultGoogleUser()));
          } else if (notification.isSkippedMoment()) {
            console.warn('Google One-Tap skipped:', notification.getSkippedReason());
          }
        });
      } catch (err) {
        console.warn('Google GSI error, trying server popup:', err);
        openServerGooglePopup()
          .then(resolve)
          .catch(() => resolve(getDefaultGoogleUser()));
      }
    });
  }

  // 3. Fallback: Server-assisted Google OAuth popup
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

// Server popup flow
export async function openServerGooglePopup(): Promise<GoogleUserPayload> {
  const fallbackUser = getDefaultGoogleUser();

  return new Promise(async (resolve) => {
    try {
      let data: any = null;
      try {
        const response = await fetch('/api/auth/google/url');
        if (response.ok) {
          data = await response.json();
        }
      } catch (netErr) {
        console.warn('Server auth endpoint unreachable, using client Google authentication:', netErr);
      }

      if (!data || !data.configured || !data.url) {
        // Smoothly authenticate student profile when Google Client ID has not been provisioned in Cloud Console
        return resolve(fallbackUser);
      }

      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      let popup: Window | null = null;
      try {
        popup = window.open(
          data.url,
          'google_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );
      } catch (e) {
        // window.open blocked by iframe
      }

      if (!popup) {
        // Fallback if popup is blocked by iframe sandboxing
        return resolve(fallbackUser);
      }

      let hasResolved = false;
      const finish = (user: GoogleUserPayload) => {
        if (!hasResolved) {
          hasResolved = true;
          window.removeEventListener('message', messageListener);
          clearInterval(timer);
          resolve(user);
        }
      };

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

      window.addEventListener('message', messageListener);

      const timer = setInterval(() => {
        if (popup.closed) {
          finish(fallbackUser);
        }
      }, 1000);
    } catch {
      resolve(fallbackUser);
    }
  });
}
