import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';

// Firebase credentials loaded from environment variables (with project defaults)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCGSs4HE0pVJG7UzivfcE7SQQHBUiV1Xhc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'schoolbus-live-e83f8.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://schoolbus-live-e83f8-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'schoolbus-live-e83f8',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'schoolbus-live-e83f8.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '548216238616',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:548216238616:web:39cf54c2ec1fef9183896d',
};

export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    if (firebaseConfig.databaseURL) {
      rtdb = getDatabase(app);
    } else {
      rtdb = getDatabase(app);
    }
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
  }
} else {
  // Helpful development notice
  if (typeof window !== 'undefined') {
    console.info(
      'SchoolBus Live: Firebase environment variables not yet provided in .env. Falling back to local offline-first & demo simulator mode. Live mobile telematics remain available via browser Geolocation API.'
    );
  }
}

export { app, auth, db, rtdb };
