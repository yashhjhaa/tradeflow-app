
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// --- CONFIGURATION ---
// NOTE: Ideally use environment variables (VITE_FIREBASE_...) for security.
const firebaseConfig = {
  // @ts-ignore
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || "AIzaSyAdJOitKMoHJSlTke9YK-8gkJ5eSpUYqGc",
  // @ts-ignore
  authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || "tradeflow-52adf.firebaseapp.com",
  // @ts-ignore
  projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || "tradeflow-52adf",
  // @ts-ignore
  storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || "tradeflow-52adf.firebasestorage.app",
  // @ts-ignore
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || "481162198870",
  // @ts-ignore
  appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || "1:481162198870:web:b88a84ddda0af081a9e0f7",
  measurementId: "G-QSPMMHQVLB"
};

// This checks if you have actually pasted the keys
const isConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE";

if (!isConfigured) {
  console.warn("Firebase keys missing. App running in Demo Mode.");
}

const app = isConfigured ? initializeApp(firebaseConfig) : null;

export const auth = isConfigured && app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();
export const db = isConfigured && app ? getFirestore(app) : null;
export const storage = isConfigured && app ? getStorage(app) : null;
export const isFirebaseReady = isConfigured;
