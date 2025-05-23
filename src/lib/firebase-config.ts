
import { initializeApp, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

// Your web app's Firebase configuration (hardcoded based on user input and screenshots)
const firebaseConfig = {
  apiKey: "AIzaSyBFTqiC1gXsIHR2pnA9Qxbt3DEQ5QSb5XQ",
  authDomain: "banner-c9919.firebaseapp.com",
  projectId: "banner-c9919",
  storageBucket: "banner-c9919.firebasestorage.app", // Corrected based on screenshot
  messagingSenderId: "957263707086",
  appId: "1:957263707086:web:151aec04a33e92eabd499f",
  measurementId: "G-KD707SRJRM"
};

// CRITICAL Pre-Initialization Check for hardcoded values
if (
  typeof firebaseConfig.apiKey !== 'string' || firebaseConfig.apiKey.trim() === "" ||
  typeof firebaseConfig.projectId !== 'string' || firebaseConfig.projectId.trim() === "" ||
  typeof firebaseConfig.authDomain !== 'string' || firebaseConfig.authDomain.trim() === ""
) {
  const errorMessage = `
    ======================================================================================
    CRITICAL Firebase Configuration Error (Hardcoded):
    The hardcoded firebaseConfig object is missing or has an empty apiKey, projectId, or authDomain.
    - API Key Value: '${firebaseConfig.apiKey}'
    - Project ID Value: '${firebaseConfig.projectId}'
    - Auth Domain Value: '${firebaseConfig.authDomain}'

    Please ensure the hardcoded firebaseConfig in src/lib/firebase-config.ts is correct.
    Firebase CANNOT be initialized properly for Authentication with these values.
    ======================================================================================`;
  console.error(errorMessage);
  // Potentially throw an error here or handle appropriately for your app's lifecycle
} else {
  console.log("[Firebase Config Check] Hardcoded firebaseConfig seems to have apiKey, projectId, and authDomain populated.");
}

// Initialize Firebase App (singleton pattern)
function createFirebaseApp(): FirebaseApp {
  try {
    return getApp();
  } catch {
    console.log("[Firebase Initialization Attempt in createFirebaseApp catch block] Initializing with hardcoded config:", JSON.parse(JSON.stringify(firebaseConfig)));
    return initializeApp(firebaseConfig);
  }
}

const firebaseApp: FirebaseApp = createFirebaseApp();
const auth: Auth = getAuth(firebaseApp);
const db: Firestore = getFirestore(firebaseApp);
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(firebaseApp);
    console.log("[Firebase Analytics] Initialized successfully.");
  } catch (error) {
    console.error("[Firebase Analytics] Failed to initialize:", error);
  }
}


// Export the App ID from the hardcoded config
export const APP_ID = firebaseConfig.appId;

// Emulator connection logic (still uses .env for this)
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR;

if (process.env.NODE_ENV === "development") {
  console.log('Using Firebase Emulators (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR):', useEmulator === "true" ? "Yes" : "No (or not set to 'true')");
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
