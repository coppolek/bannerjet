
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";

// IMPORTANT: Replace with your actual Firebase configuration
// These values should be in your .env file

if (process.env.NODE_ENV === 'development') {
  console.log('Firebase API Key from .env:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? `Exists (starts with: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY.substring(0, 5)}...)` : 'MISSING or undefined. Check your .env file.');
  console.log('Firebase Project ID from .env:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING or undefined. Check your .env file.');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function createFirebaseApp(config: object): FirebaseApp {
  try {
    return getApp();
  } catch {
    return initializeApp(config);
  }
}

const firebaseApp: FirebaseApp = createFirebaseApp(firebaseConfig);
const auth: Auth = getAuth(firebaseApp);
const db: Firestore = getFirestore(firebaseApp);

// Placeholder for App ID, in a real app, this might come from env or context
export const APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "bannerforge-ai-app";


if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Check if emulators are already running to avoid re-connecting
  // This is a simple check; a more robust solution might be needed
  // @ts-ignore
  if (!auth.emulatorConfig && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
    try {
      console.log("Connecting to Firebase Auth Emulator");
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    } catch (error) {
      console.error("Error connecting to Auth Emulator:", error);
    }
  }
  // @ts-ignore
  if (!db.INTERNAL.settings.host && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
     try {
      console.log("Connecting to Firebase Firestore Emulator");
      connectFirestoreEmulator(db, "localhost", 8080);
    } catch (error) {
      console.error("Error connecting to Firestore Emulator:", error);
    }
  }
}


export { firebaseApp, auth, db };
