// Firebase client initialization for Next.js
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Direct references so Next.js can inline them at build time (dynamic indexing breaks this)
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID; // optional

const firebaseConfig: FirebaseOptions = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
};

// Validate required values
const missing: string[] = [];
if (!apiKey) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!authDomain) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!storageBucket) missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
if (!messagingSenderId) missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
if (!appId) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID');

if (missing.length) {
  throw new Error(`Missing Firebase env vars: ${missing.join(', ')}. Add them to .env.local (no quotes) then restart dev server.`);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (process.env.NODE_ENV === 'development') {
  const ak = apiKey || '';
  // eslint-disable-next-line no-console
  console.log('[Firebase] Initialized', {
    apiKeyPreview: ak ? `${ak.slice(0, 6)}...${ak.slice(-4)}` : 'missing',
    projectId,
  });
}

export { auth, db, storage };
