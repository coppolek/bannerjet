
"use client";

import type { FirebaseApp } from "firebase/app";
import type { Auth, User, UserCredential } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { firebaseApp, auth as firebaseAuth, db as firebaseDb, APP_ID } from "@/lib/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { Toaster } from "@/components/ui/toaster";
import { doc, getDoc } from "firebase/firestore";
import type { BannerData, AiContentData, AmazonContentData } from "@/lib/types";
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

  handleSignUp: (email: string, password: string) => Promise<UserCredential | null>;
  handleSignIn: (email: string, password: string) => Promise<UserCredential | null>;
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
      setIsLoadingAuth(true); // Set loading true at the start of auth change
      setIsLoadingAdminStatus(true); // Also set admin status loading true
      console.log(
        "[AppProvider] onAuthStateChanged triggered. currentUser UID:",
        currentUser ? currentUser.uid : "null",
        "Email:", currentUser ? currentUser.email : "N/A"
      );

      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        setUserEmail(currentUser.email);

        // Fetch admin status
        try {
          console.log(`[AppProvider] Fetching admin status for user: ${currentUser.uid}`);
          const userDocRef = doc(firebaseDb, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setIsAdmin(userData?.isAdmin === true);
            console.log(`[AppProvider] Admin status for ${currentUser.uid}: ${userData?.isAdmin === true}`);
          } else {
            setIsAdmin(false);
            console.log(`[AppProvider] No user profile found for ${currentUser.uid}, assuming not admin.`);
          }
        } catch (error) {
          console.error("[AppProvider] Error fetching admin status:", error);
          setIsAdmin(false); // Default to not admin on error
          toast({ variant: "destructive", title: "Error fetching user role", description: "Could not determine admin status." });
        }
        setIsLoadingAdminStatus(false);
        
        // Shared content loading logic
        const urlParams = new URLSearchParams(window.location.search);
        const sharedAiContentId = urlParams.get('sharedAiContentId');
        const sharedAmazonContentId = urlParams.get('sharedAmazonContentId');

        if (sharedAiContentId) {
          try {
            const sharedAiContentDocRef = doc(firebaseDb, `artifacts/${APP_ID}/public/sharedAiContent`, sharedAiContentId);
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
            const sharedAmazonContentDocRef = doc(firebaseDb, `artifacts/${APP_ID}/public/sharedAmazonContent`, sharedAmazonContentId);
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
        // User is signed out or no user
        setUser(null);
        setUserId(null);
        setUserEmail(null);
        setIsAdmin(false);
        setIsLoadingAdminStatus(false); // No user, so admin status check is complete
        console.log("[AppProvider] No current user or user signed out. isLoadingAuth will be set to false.");
      }
      setIsLoadingAuth(false); // Auth processing done
      console.log(`[AppProvider] Auth state processed. isLoadingAuth: false, isLoadingAdminStatus: ${isLoadingAdminStatus}`);
    });

    return () => {
      console.log("[AppProvider] Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    };
  }, [toast]); // Added toast to dependency array as it's used in the effect

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const handleSignUp = async (email: string, password: string): Promise<UserCredential | null> => {
    try {
      const userCredential = await emailPasswordSignUp(firebaseAuth, email, password);
      toast({ title: "Registration Successful!", description: "You can now log in." });
      // Note: onAuthStateChanged will handle setting user, admin status, and closing modal if needed
      // We can optimistically close it or wait for onAuthStateChanged. For now, we let onAuthStateChanged do its work.
      // If you want to create a user profile document on sign up, this is where you'd do it.
      // e.g., await setDoc(doc(firebaseDb, "users", userCredential.user.uid), { email: userCredential.user.email, isAdmin: false, createdAt: serverTimestamp() });
      return userCredential;
    } catch (error: any) {
      console.error("[AppProvider] SignUp Error:", error);
      toast({ variant: "destructive", title: "Registration Failed", description: error.message || "Please try again." });
      return null;
    }
  };
  
  const handleSignIn = async (email: string, password: string): Promise<UserCredential | null> => {
    try {
      const userCredential = await emailPasswordSignIn(firebaseAuth, email, password);
      // onAuthStateChanged will be triggered, which will handle setting user, admin status, etc.
      // It will also close the modal via the effect if successful.
      toast({ title: "Login Successful!", description: `Welcome back, ${userCredential.user.email}!` });
      closeAuthModal(); // Close modal immediately on successful sign-in
      return userCredential;
    } catch (error: any)
       {
      console.error("[AppProvider] SignIn Error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials or user not found." });
      return null;
    }
  };

  const handleSignOut = async () => {
    try {
      await appSignOut(firebaseAuth);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      // onAuthStateChanged will handle clearing user, admin status, etc.
    } catch (error: any) {
      console.error("[AppProvider] SignOut Error:", error);
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

    