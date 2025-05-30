
"use client";

import type { FirebaseApp } from "firebase/app";
import type { Auth, User, UserCredential } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { firebaseApp, auth as firebaseAuth, db as firebaseDb, APP_ID } from "@/lib/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { Toaster } from "@/components/ui/toaster";
import { doc, getDoc, serverTimestamp, setDoc as setFirestoreDoc, Timestamp } from "firebase/firestore"; // Added Timestamp
import type { BannerData, AiContentData, AmazonContentData, UserProfile } from "@/lib/types";
import { emailPasswordSignUp, emailPasswordSignIn, appSignOut } from "@/lib/firebase-service";
import { useToast } from "@/hooks/use-toast";

interface AppContextType {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  user: User | null;
  userId: string | null;
  userEmail: string | null;
  isLoadingAuth: boolean;
  appId: string;
  
  isAdmin: boolean;
  isLoadingAdminStatus: boolean;

  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;

  handleSignUp: (email: string, password: string) => Promise<{ success: boolean; error?: string | null; userCredential?: UserCredential | null }>;
  handleSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string | null; userCredential?: UserCredential | null }>;
  handleSignOut: () => Promise<void>;

  setInitialBannerData: (data: Partial<BannerData>) => void;
  setInitialAiContent: (data: Partial<AiContentData>) => void;
  setInitialAmazonContent: (data: Partial<AmazonContentData>) => void;
  initialBannerData?: Partial<BannerData>;
  initialAiContent?: Partial<AiContentData>;
  initialAmazonContent?: Partial<AmazonContentData>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoadingAdminStatus, setIsLoadingAdminStatus] = useState<boolean>(true); 
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toast } = useToast();

  const [initialBannerData, setInitialBannerData] = useState<Partial<BannerData> | undefined>(undefined);
  const [initialAiContent, setInitialAiContent] = useState<Partial<AiContentData> | undefined>(undefined);
  const [initialAmazonContent, setInitialAmazonContent] = useState<Partial<AmazonContentData> | undefined>(undefined);

  useEffect(() => {
    console.log("[AppProvider] useEffect for onAuthStateChanged mounting.");
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      console.log(
        "[AppProvider] onAuthStateChanged triggered. currentUser UID:",
        currentUser ? currentUser.uid : "null",
        "Email:", currentUser ? currentUser.email : "N/A"
      );
      
      setIsLoadingAuth(true); 
      setIsLoadingAdminStatus(true);
      setIsAdmin(false); // Reset admin status on auth change

      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        setUserEmail(currentUser.email);
        console.log(`[AppProvider] User authenticated: ${currentUser.uid}, Email: ${currentUser.email}`);

        const userDocPath = `users/${currentUser.uid}`;
        console.log(`[AppProvider] Attempting to fetch admin status for user: ${currentUser.uid} from path: ${userDocPath}`);
        try {
          const userDocRef = doc(firebaseDb, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserProfile;
            console.log(`[AppProvider] User profile data for ${currentUser.uid}:`, userData);
            setIsAdmin(userData?.isAdmin === true);
            console.log(`[AppProvider] Admin status for ${currentUser.uid} set to: ${userData?.isAdmin === true}`);
          } else {
            setIsAdmin(false);
            console.warn(`[AppProvider] User profile document NOT found at ${userDocPath} for ${currentUser.uid}. Assuming not admin.`);
            // It's possible the profile document needs to be created if it wasn't during signup (e.g. for an existing auth user logging in for the first time to this app version)
            // Or if the signup profile creation failed.
            // For now, we assume not admin if profile doc is missing.
          }
        } catch (error) {
          const firebaseError = error as any; // Cast to any to access potential code property
          console.error(`[AppProvider] Error fetching admin status for user ${currentUser.uid} from path ${userDocPath}. Code: ${firebaseError.code}. Message: ${firebaseError.message}. Full error:`, error);
          toast({ variant: "destructive", title: "Error Fetching User Role", description: `Could not determine admin status. Error: ${firebaseError.message}` });
          setIsAdmin(false); 
        }
        setIsLoadingAdminStatus(false);
        
        // Logic for handling shared content from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const sharedAiContentId = urlParams.get('sharedAiContentId');
        const sharedAmazonContentId = urlParams.get('sharedAmazonContentId');

        if (sharedAiContentId) {
          try {
            const sharedAiContentDocRef = doc(firebaseDb, "publicSharedAiContent", sharedAiContentId);
            const sharedAiContentSnap = await getDoc(sharedAiContentDocRef);
            if (sharedAiContentSnap.exists()) {
              setInitialAiContent(sharedAiContentSnap.data() as AiContentData);
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('sharedAiContentId');
              window.history.replaceState({}, document.title, newUrl.toString());
            }
          } catch (error) { console.error("[AppProvider] Error loading shared AI content:", error); }
        } else if (sharedAmazonContentId) {
          try {
            const sharedAmazonContentDocRef = doc(firebaseDb, "publicSharedAmazonContent", sharedAmazonContentId);
            const sharedAmazonContentSnap = await getDoc(sharedAmazonContentDocRef);
            if (sharedAmazonContentSnap.exists()) {
              setInitialAmazonContent(sharedAmazonContentSnap.data() as AmazonContentData);
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('sharedAmazonContentId');
              window.history.replaceState({}, document.title, newUrl.toString());
            }
          } catch (error) { console.error("[AppProvider] Error loading shared Amazon AI content:", error); }
        }
      } else { 
        setUser(null);
        setUserId(null);
        setUserEmail(null);
        setIsAdmin(false); // Ensure isAdmin is false if no user
        setIsLoadingAdminStatus(false); // No admin status to load if no user
        console.log("[AppProvider] No current user or user signed out.");
      }
      setIsLoadingAuth(false);
      console.log(`[AppProvider] Auth state processed. isLoadingAuth: ${isLoadingAuth}, isLoadingAdminStatus (final for this cycle): ${isLoadingAdminStatus}, isAdmin: ${isAdmin}, userId: ${userId}`);
    });

    return () => {
      console.log("[AppProvider] Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keep dependencies minimal, auth state changes should be the main driver

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    // setError(null); // Reset error when closing modal, if error state was managed here
  }, []);

  const handleSignUp = async (email: string, password: string): Promise<{ success: boolean; error?: string | null; userCredential?: UserCredential | null }> => {
    try {
      const userCredential = await emailPasswordSignUp(firebaseAuth, email, password);
      console.log("[AppProvider] SignUp successful for email:", email, "UID:", userCredential.user.uid);
      toast({ title: "Registration Successful!", description: "You are now logged in." });
      
      // Ensure user profile document is created in Firestore
      try {
        const userDocRef = doc(firebaseDb, "users", userCredential.user.uid);
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
            console.log(`[AppProvider] User profile for ${userCredential.user.uid} does not exist. Attempting to create with isAdmin: false.`);
            await setFirestoreDoc(userDocRef, {
              email: userCredential.user.email,
              isAdmin: false, // Default new users to not be admins
              createdAt: serverTimestamp() as Timestamp // Firestore Server Timestamp
            });
            console.log("[AppProvider] User profile created in Firestore for:", userCredential.user.uid);
        } else {
            console.log("[AppProvider] User profile already exists for:", userCredential.user.uid, " Skipping default profile creation.");
        }
      } catch (profileError) {
        const fbProfileError = profileError as any;
        console.error(`[AppProvider] Error ensuring user profile in Firestore for ${userCredential.user.uid}. Code: ${fbProfileError.code}. Message: ${fbProfileError.message}. Full error:`, profileError);
        toast({ variant: "destructive", title: "User Profile Error", description: `Could not create or verify user profile during sign up. Error: ${fbProfileError.message}`});
        // Continue with signup success as auth worked, profile is secondary here for immediate login
      }
      closeAuthModal();
      return { success: true, userCredential, error: null };
    } catch (error: any) {
      console.error("[AppProvider] SignUp Error:", error.code, error.message, error);
      const errorMessage = error.message || "Please try again.";
      toast({ variant: "destructive", title: "Registration Failed", description: errorMessage });
      return { success: false, error: errorMessage, userCredential: null };
    }
  };
  
  const handleSignIn = async (email: string, password: string): Promise<{ success: boolean; error?: string | null; userCredential?: UserCredential | null }> => {
    try {
      const userCredential = await emailPasswordSignIn(firebaseAuth, email, password);
      console.log("[AppProvider] SignIn successful for email:", email, "UID:", userCredential.user.uid);
      toast({ title: "Login Successful!", description: `Welcome back!` });
      closeAuthModal(); 
      return { success: true, userCredential, error: null };
    } catch (error: any) {
      console.error("[AppProvider] SignIn Error:", error.code, error.message, error);
      const errorMessage = error.message || "Invalid credentials or user not found.";
      toast({ variant: "destructive", title: "Login Failed", description: errorMessage });
      return { success: false, error: errorMessage, userCredential: null };
    }
  };

  const handleSignOut = async () => {
    try {
      await appSignOut(firebaseAuth);
      console.log("[AppProvider] User signed out successfully.");
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      // State (user, userId, userEmail, isAdmin) will be reset by onAuthStateChanged
    } catch (error: any) {
      console.error("[AppProvider] SignOut Error:", error.code, error.message, error);
      toast({ variant: "destructive", title: "Sign Out Failed", description: error.message || "Please try again." });
    }
  };

  const contextValue: AppContextType = {
    firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    user,
    userId,
    userEmail,
    isLoadingAuth,
    appId: APP_ID,
    isAdmin,
    isLoadingAdminStatus,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    handleSignUp,
    handleSignIn,
    handleSignOut,
    setInitialBannerData,
    setInitialAiContent,
    setInitialAmazonContent,
    initialBannerData,
    initialAiContent,
    initialAmazonContent,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
      <Toaster />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
