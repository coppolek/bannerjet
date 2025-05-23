
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
      "Firebase Configuration Error (Initial Check): " + firebaseEnvIssues +
      "Please ensure all required Firebase environment variables are set correctly in your .env file (located in the project root), " +
      "that they are prefixed with NEXT_PUBLIC_, and that you have RESTARTED your Next.js development server after making changes."
    );
  } else {
    let apiKeyStatus = 'MISSING or undefined!';
    if (apiKey && apiKey.trim() !== "") {
      apiKeyStatus = `Exists (starts with: ${apiKey.substring(0, 5)}...)`;
    } else if (apiKey === "") {
      apiKeyStatus = 'Exists but is an EMPTY STRING!';
    }
    console.log('Firebase API Key from .env (Initial Check):', apiKeyStatus);
    console.log('Firebase Project ID from .env (Initial Check):', projectId || 'MISSING or undefined!');
    console.log('Using Firebase Emulators (.env NEXT_PUBLIC_USE_FIREBASE_EMULATOR - Initial Check):', useEmulator === "true" ? "Yes" : "No (or not set to 'true')");
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

// More aggressive check immediately after constructing firebaseConfig
if (typeof firebaseConfig.apiKey !== 'string' || firebaseConfig.apiKey.trim() === "" ||
    typeof firebaseConfig.projectId !== 'string' || firebaseConfig.projectId.trim() === "") {
  const errorMessage = `
    ======================================================================================
    CRITICAL Firebase Configuration Error (Pre-Initialization):
    NEXT_PUBLIC_FIREBASE_API_KEY or NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing, empty, or not a string.
    - API Key Raw Value: '${apiKey}' (Type: ${typeof apiKey})
    - Project ID Raw Value: '${projectId}' (Type: ${typeof projectId})

    Please ensure:
    1. Your .env file is located in the ROOT directory of your project.
    2. It contains the correct, non-empty values for ALL NEXT_PUBLIC_FIREBASE_... variables.
       (Copy them directly from your Firebase project settings).
    3. You have RESTARTED your Next.js development server (e.g., stop 'npm run dev' and run it again).

    Firebase CANNOT be initialized with these values. The application will likely fail.
    ======================================================================================`;
  console.error(errorMessage);
  // Note: Firebase will still attempt to initialize and throw its own error,
  // but this log should make the root cause clearer if it's an .env loading issue.
}


function createFirebaseApp(config: { apiKey?: string; projectId?: string; [key: string]: any }): FirebaseApp {
  try {
    return getApp();
  } catch {
    if (typeof config.apiKey !== 'string' || config.apiKey.trim() === "" ||
        typeof config.projectId !== 'string' || config.projectId.trim() === "") {
      console.warn("createFirebaseApp: Attempting to initialize Firebase with missing or empty API Key or Project ID. This will likely fail. Config received:", config);
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
