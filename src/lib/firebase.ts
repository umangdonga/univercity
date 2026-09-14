import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Client-side environment variables
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else {
  console.info(
    'Firebase environment variables are not fully configured yet. Add VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID to enable live Firebase Auth.'
  );
}

export { app, auth, db, googleProvider };

export interface GoogleAuthResult {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isNewUser?: boolean;
}

/**
 * Triggers Google OAuth Popup via Firebase Authentication
 */
export async function signInWithGooglePopup(): Promise<GoogleAuthResult> {
  if (!auth || !googleProvider) {
    throw new Error(
      'FIREBASE_NOT_CONFIGURED: Please configure your Firebase credentials in the Settings/environment variables or use the fallback Google sign-in.'
    );
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Persist basic user data to Firestore if database is initialized
    if (db && user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            uid: user.uid,
            name: user.displayName || 'Google User',
            email: user.email,
            photoURL: user.photoURL,
            lastLoginAt: serverTimestamp(),
            authProvider: 'google.com',
          },
          { merge: true }
        );
      } catch (dbErr) {
        console.warn('Could not save user profile to Firestore:', dbErr);
      }
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  } catch (error: any) {
    // Map Firebase specific error codes to friendly human-readable messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled: The Google sign-in window was closed.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in cancelled: Another sign-in popup was already active.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup blocked: Please allow popups for this site in your browser settings.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error(
        `Unauthorized domain: Please add this domain (${window.location.hostname}) to Authorized Domains in Firebase Console > Authentication > Settings.`
      );
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error: Please check your internet connection and try again.');
    }
    throw new Error(error.message || 'Failed to authenticate with Google.');
  }
}

/**
 * Signs the user out from Firebase
 */
export async function signOutFromFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Listens for Firebase Auth State Changes
 */
export function subscribeToFirebaseAuthState(
  callback: (user: FirebaseUser | null) => void
): () => void {
  if (!auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
