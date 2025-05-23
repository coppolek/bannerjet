
import { initializeApp, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration (as provided by user)
const firebaseConfig = {
  apiKey: "AIzaSyBFTqiC1gXsIHR2pnA9Qxbt3DEQ5QSb5XQ",
  authDomain: "banner-c9919.firebaseapp.com",
  projectId: "banner-c9919",
  storageBucket: "banner-c9919.appspot.com", // Corrected from .firebasestorage.app
  messagingSenderId: "957263707086",
  appId: "1:957263707086:web:151aec04a33e92eabd499f",
  measurementId: "G-KD707SRJRM"
};

// Check if critical Firebase config values are present (from hardcoded config)
if (typeof firebaseConfig.apiKey !== 'string' || firebaseConfig.apiKey.trim() === "" ||
    typeof firebaseConfig.projectId !== 'string' || firebaseConfig.projectId.trim() === "") {
  const errorMessage = `
    ======================================================================================
    CRITICAL Firebase Configuration Error (Hardcoded):
    The hardcoded firebaseConfig object is missing a valid apiKey or projectId.
    - API Key Value: '${firebaseConfig.apiKey}'
    - Project ID Value: '${firebaseConfig.projectId}'

    Please ensure the hardcoded firebaseConfig in src/lib/firebase-config.ts is correct.
    Firebase CANNOT be initialized with these values. The application will likely fail.
    ======================================================================================`;
  console.error(errorMessage);
  // Potentially throw an error here or handle appropriately for your app's lifecycle
}

// Initialize Firebase App (singleton pattern)
function createFirebaseApp(): FirebaseApp {
  try {
    return getApp();
  } catch {
    console.log("[Firebase Initialization Attempt] Initializing with hardcoded config:", JSON.parse(JSON.stringify(firebaseConfig)));
    return initializeApp(firebaseConfig);
  }
}

const firebaseApp: FirebaseApp = createFirebaseApp();
const auth: Auth = getAuth(firebaseApp);
const db: Firestore = getFirestore(firebaseApp);
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  analytics = getAnalytics(firebaseApp);
}

// Export the App ID from the hardcoded config
export const APP_ID = firebaseConfig.appId;

// Emulator connection logic (still uses .env for this)
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR;

if (process.env.NODE_ENV === "development") {
  console.log('Using Firebase Emulators (.env NEXT_PUBLIC_USE_FIREBASE_EMULATOR):', useEmulator === "true" ? "Yes" : "No (or not set to 'true')");
}

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
  if (!db.INTERNAL?.settings?.host) { 
     try {
      console.log("Connecting to Firebase Firestore Emulator (localhost:8080)");
      connectFirestoreEmulator(db, "localhost", 8080);
    } catch (error) {
      console.error("Error connecting to Firestore Emulator:", error);
    }
  }
}

export { firebaseApp, auth, db, analytics };
