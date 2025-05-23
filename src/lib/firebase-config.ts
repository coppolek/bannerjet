
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";

// Read all Firebase environment variables
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const appIdEnv = process.env.NEXT_PUBLIC_FIREBASE_APP_ID; // Renamed to avoid conflict with exported APP_ID
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR;

if (process.env.NODE_ENV === 'development') {
  let firebaseEnvIssues = "";
  if (!apiKey) firebaseEnvIssues += "NEXT_PUBLIC_FIREBASE_API_KEY is missing. ";
  if (!authDomain) firebaseEnvIssues += "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing. ";
  if (!projectId) firebaseEnvIssues += "NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing. ";
  // Optional, but good to note if missing
  if (!storageBucket) firebaseEnvIssues += "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is missing (often optional). ";
  if (!messagingSenderId) firebaseEnvIssues += "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is missing (often optional). ";
  if (!appIdEnv) firebaseEnvIssues += "NEXT_PUBLIC_FIREBASE_APP_ID is missing (often optional). ";

  if (firebaseEnvIssues) {
    console.error(
      "Firebase Configuration Error: " + firebaseEnvIssues +
      "Please ensure all required Firebase environment variables are set correctly in your .env file (located in the project root), " +
      "that they are prefixed with NEXT_PUBLIC_, and that you have RESTARTED your Next.js development server after making changes."
    );
  } else {
    // All critical keys seem present, log a portion for verification
    console.log('Firebase API Key from .env:', apiKey ? `Exists (starts with: ${apiKey.substring(0, 5)}...)` : 'MISSING!');
    console.log('Firebase Project ID from .env:', projectId || 'MISSING!');
  }
}

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appIdEnv, // Use the value read from .env
};

// Explicit check before initializing Firebase App
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  const message = `Critical Firebase config missing: API Key or Project ID is undefined before Firebase initialization. API Key loaded: ${!!firebaseConfig.apiKey}, Project ID loaded: ${!!firebaseConfig.projectId}. Please check your .env file and ensure the Next.js server was restarted.`;
  console.error(message);
  // It's generally better to let Firebase SDK throw its specific error if config is truly bad,
  // rather than throwing a new error here that might mask the original Firebase error.
  // But this console error provides an earlier warning.
}

function createFirebaseApp(config: object): FirebaseApp {
  try {
    return getApp();
  } catch {
    // @ts-ignore - apiKey and projectId could be undefined if .env is not set
    if (!config.apiKey || !config.projectId) {
        console.warn("Attempting to initialize Firebase with missing API Key or Project ID. This will likely fail.");
    }
    return initializeApp(config);
  }
}

const firebaseApp: FirebaseApp = createFirebaseApp(firebaseConfig);
const auth: Auth = getAuth(firebaseApp);
const db: Firestore = getFirestore(firebaseApp);

// Export the App ID (can be the one from .env or a fallback)
export const APP_ID = appIdEnv || "bannerforge-ai-app";


if (process.env.NODE_ENV === "development" && typeof window !== "undefined" && useEmulator === "true") {
  // @ts-ignore - emulatorConfig is not part of the public type but used internally by Firebase
  if (!auth.emulatorConfig) {
    try {
      console.log("Connecting to Firebase Auth Emulator (http://localhost:9099)");
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    } catch (error) {
      console.error("Error connecting to Auth Emulator:", error);
    }
  }
  // @ts-ignore - INTERNAL.settings.host is not part of public type
  if (!db.INTERNAL?.settings?.host) { // Added optional chaining for safety
     try {
      console.log("Connecting to Firebase Firestore Emulator (localhost:8080)");
      connectFirestoreEmulator(db, "localhost", 8080);
    } catch (error) {
      console.error("Error connecting to Firestore Emulator:", error);
    }
  }
}

export { firebaseApp, auth, db };
