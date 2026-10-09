import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

/**
 * Official Firebase Configuration for Pratibha Platform
 * Project: pratibha-c71c0
 */
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAmvLIbmhQraSg3KHsKZafX_WyBO3CcptY",
  authDomain: "pratibha-c71c0.firebaseapp.com",
  projectId: "pratibha-c71c0",
  storageBucket: "pratibha-c71c0.firebasestorage.app",
  messagingSenderId: "419422595748",
  appId: "1:419422595748:web:df8e1672be43bc71951431",
  measurementId: "G-47Q5D5TYGQ"
};

/**
 * Retrieves Firebase configuration from Vite environment variables,
 * localStorage override, or default project credentials.
 */
export function getFirebaseConfig() {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  if (envConfig.apiKey && envConfig.authDomain) {
    return envConfig;
  }

  try {
    const local = localStorage.getItem('pratibha_firebase_config');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.apiKey && parsed.authDomain) {
        return parsed;
      }
    }
  } catch {
    // Local storage not available
  }

  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem('pratibha_firebase_config', JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());

// Initialize Analytics safely (works only in browser environments)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch {
        // Analytics optional
      }
    }
  }).catch(() => {});
}

// Initialize Auth
export const auth = getAuth(app);

export function getFirebaseAuthInstance() {
  return auth;
}

/**
 * Executes Google Sign-In with popup via Firebase Auth SDK.
 */
export async function signInWithGoogleFirebase() {
  const authInstance = getFirebaseAuthInstance();
  if (!authInstance) {
    throw new Error('FIREBASE_CONFIG_REQUIRED');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(authInstance, provider);
  const user = result.user;

  return {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Google User',
    email: user.email,
    avatar: user.photoURL || 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    authProvider: 'firebase_google',
  };
}

export async function signOutFirebase() {
  const authInstance = getFirebaseAuthInstance();
  if (authInstance) {
    try {
      await signOut(authInstance);
    } catch {
      // ignore
    }
  }
}
