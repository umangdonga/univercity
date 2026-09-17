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
import firebaseConfig from '../../firebase-applet-config.json';

export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

export { app, auth, googleProvider };

export interface GoogleAuthResult {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  idToken?: string;
}

/**
 * Triggers Google OAuth Popup via Firebase Authentication
 */
export async function signInWithGooglePopup(): Promise<GoogleAuthResult> {
  if (!auth || !googleProvider) {
    throw new Error(
      'Authentication is not initialized. Please verify firebase-applet-config.json.'
    );
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await user.getIdToken();

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      idToken,
    };
  } catch (error: any) {
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
