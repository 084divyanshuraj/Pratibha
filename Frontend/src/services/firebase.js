import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

/**
 * Retrieves Firebase configuration from Vite environment variables
 * or locally configured storage.
 */
export function getFirebaseConfig() {
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
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

  return null;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem('pratibha_firebase_config', JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

/**
 * Initializes and returns the Firebase Auth instance.
 */
export function getFirebaseAuthInstance() {
  const config = getFirebaseConfig();
  if (!config) return null;

  const app = getApps().length > 0 ? getApp() : initializeApp(config);
  return getAuth(app);
}

/**
 * Executes Google Sign-In with popup via Firebase Auth SDK.
 */
export async function signInWithGoogleFirebase() {
  const auth = getFirebaseAuthInstance();
  if (!auth) {
    throw new Error('FIREBASE_CONFIG_REQUIRED');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
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
  const auth = getFirebaseAuthInstance();
  if (auth) {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  }
}
