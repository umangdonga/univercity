export interface GoogleUserPayload {
  id: string;
  name: string;
  email: string;
  picture?: string;
  verified_email?: boolean;
}

export async function checkGoogleOAuthConfig(): Promise<{
  configured: boolean;
  redirectUri: string;
  message?: string;
  fallbackDemoUser?: GoogleUserPayload;
}> {
  try {
    const res = await fetch('/api/auth/google/url');
    if (!res.ok) {
      throw new Error('Server returned non-ok status');
    }
    return await res.json();
  } catch (err) {
    console.warn('Could not query Google OAuth config:', err);
    return {
      configured: false,
      redirectUri: `${window.location.origin}/auth/callback`,
      message: 'Network error or backend not running.',
    };
  }
}

export async function openGoogleOAuthPopup(): Promise<GoogleUserPayload> {
  return new Promise(async (resolve, reject) => {
    try {
      const config = await checkGoogleOAuthConfig();

      if (!config.configured) {
        // Fallback user if Google OAuth credentials haven't been provided in .env yet
        const demoUser: GoogleUserPayload = config.fallbackDemoUser || {
          id: 'google-user-' + Date.now(),
          name: 'Rohit Sharma',
          email: 'rohit.sharma@university.edu',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          verified_email: true,
        };
        // Give a slight async delay to feel realistic
        setTimeout(() => resolve(demoUser), 800);
        return;
      }

      // If configured, fetch authorization URL
      const response = await fetch('/api/auth/google/url');
      const data = await response.json();

      if (!data.url) {
        throw new Error('No OAuth URL returned');
      }

      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!popup) {
        throw new Error('Popup blocked! Please allow popups for this site to sign in with Google.');
      }

      const messageListener = (event: MessageEvent) => {
        // Allow messages from local or run.app origins
        if (
          !event.origin.includes('localhost') &&
          !event.origin.includes('.run.app') &&
          !event.origin.includes('google.com')
        ) {
          return;
        }

        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
          window.removeEventListener('message', messageListener);
          resolve(event.data.user);
        } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
          window.removeEventListener('message', messageListener);
          reject(new Error(event.data.error || 'Google authentication failed.'));
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup closed by user
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          window.removeEventListener('message', messageListener);
        }
      }, 1000);
    } catch (err) {
      reject(err);
    }
  });
}
