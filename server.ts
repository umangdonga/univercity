import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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
