
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
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { toast } = useToast();

  const [initialBannerData, setInitialBannerData] = useState<Partial<BannerData> | undefined>(undefined);
  const [initialAiContent, setInitialAiContent] = useState<Partial<AiContentData> | undefined>(undefined);
  const [initialAmazonContent, setInitialAmazonContent] = useState<Partial<AmazonContentData> | undefined>(undefined);

  useEffect(() => {
    console.log("[AppProvider] useEffect for onAuthStateChanged mounting. Initial isLoadingAuth:", isLoadingAuth);
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      console.log(
        "[AppProvider] onAuthStateChanged triggered. currentUser UID:",
        currentUser ? currentUser.uid : "null",
        "Email:", currentUser ? currentUser.email : "N/A"
      );

      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        setUserEmail(currentUser.email);
        
        // Shared content loading logic (remains the same)
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
        console.log("[AppProvider] No current user or user signed out.");
      }
      console.log("[AppProvider] Auth state processed. Setting isLoadingAuth to false.");
      setIsLoadingAuth(false);
    });

    return () => {
      console.log("[AppProvider] Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    };
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const handleSignUp = async (email: string, password: string): Promise<UserCredential | null> => {
    try {
      const userCredential = await emailPasswordSignUp(firebaseAuth, email, password);
      toast({ title: "Registration Successful!", description: "You can now log in." });
      closeAuthModal();
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
      toast({ title: "Login Successful!", description: `Welcome back, ${userCredential.user.email}!` });
      closeAuthModal();
      // onAuthStateChanged will handle setting user state
      return userCredential;
    } catch (error: any) {
      console.error("[AppProvider] SignIn Error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials or user not found." });
      return null;
    }
  };

  const handleSignOut = async () => {
    try {
      await appSignOut(firebaseAuth);
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      // onAuthStateChanged will handle clearing user state
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
