
"use client";

import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import type { Firestore }import "firebase/firestore";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { firebaseApp, auth as firebaseAuth, db as firebaseDb, APP_ID } from "@/lib/firebase-config";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { Toaster } from "@/components/ui/toaster";
import { doc, getDoc } from "firebase/firestore";
import type { BannerData, AiContentData, AmazonContentData, BannerPlatform } from "@/lib/types";

interface AppContextType {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  user: User | null;
  userId: string | null;
  isLoadingAuth: boolean;
  appId: string;
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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const [initialBannerData, setInitialBannerData] = useState<Partial<BannerData> | undefined>(undefined);
  const [initialAiContent, setInitialAiContent] = useState<Partial<AiContentData> | undefined>(undefined);
  const [initialAmazonContent, setInitialAmazonContent] = useState<Partial<AmazonContentData> | undefined>(undefined);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setIsLoadingAuth(true);
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        
        const urlParams = new URLSearchParams(window.location.search);
        const sharedAiContentId = urlParams.get('sharedAiContentId');
        const sharedAmazonContentId = urlParams.get('sharedAmazonContentId');

        if (sharedAiContentId) {
          try {
            const sharedAiContentDocRef = doc(firebaseDb, `artifacts/${APP_ID}/public/sharedAiContent`, sharedAiContentId);
            const sharedAiContentSnap = await getDoc(sharedAiContentDocRef);
            if (sharedAiContentSnap.exists()) {
              const data = sharedAiContentSnap.data() as AiContentData;
              setInitialAiContent(data);
              // Clear from URL
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('sharedAiContentId');
              window.history.replaceState({}, document.title, newUrl.toString());
            }
          } catch (error) {
            console.error("Error loading shared AI content:", error);
          }
        } else if (sharedAmazonContentId) {
          try {
            const sharedAmazonContentDocRef = doc(firebaseDb, `artifacts/${APP_ID}/public/sharedAmazonContent`, sharedAmazonContentId);
            const sharedAmazonContentSnap = await getDoc(sharedAmazonContentDocRef);
            if (sharedAmazonContentSnap.exists()) {
              const data = sharedAmazonContentSnap.data() as AmazonContentData;
              setInitialAmazonContent(data);
               // Clear from URL
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('sharedAmazonContentId');
              window.history.replaceState({}, document.title, newUrl.toString());
            }
          } catch (error) {
            console.error("Error loading shared Amazon AI content:", error);
          }
        }

      } else {
        // Not signed in, try anonymous sign-in
        try {
          await signInAnonymously(firebaseAuth);
        } catch (error) {
          console.error("Anonymous sign-in failed:", error);
          setUser(null);
          setUserId(null);
        }
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const contextValue: AppContextType = {
    firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    user,
    userId,
    isLoadingAuth,
    appId: APP_ID,
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
