
"use client";

import type { FirebaseApp } from "firebase/app";
import type { Auth, User } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
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
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Start as true
  
  const [initialBannerData, setInitialBannerData] = useState<Partial<BannerData> | undefined>(undefined);
  const [initialAiContent, setInitialAiContent] = useState<Partial<AiContentData> | undefined>(undefined);
  const [initialAmazonContent, setInitialAmazonContent] = useState<Partial<AmazonContentData> | undefined>(undefined);


  useEffect(() => {
    console.log("[AppProvider] useEffect for onAuthStateChanged starting.");
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      console.log(
        "[AppProvider] onAuthStateChanged triggered. currentUser:",
        currentUser ? currentUser.uid : "null",
        "isAnonymous:",
        currentUser ? currentUser.isAnonymous : "N/A"
      );

      if (currentUser) {
        console.log(
          "[AppProvider] currentUser exists. Setting user and userId:",
          currentUser.uid
        );
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
              console.log("[AppProvider] Loaded shared AI content:", data);
              setInitialAiContent(data);
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('sharedAiContentId');
              window.history.replaceState({}, document.title, newUrl.toString());
            } else {
              console.warn("[AppProvider] Shared AI content ID found in URL, but no document found in Firestore:", sharedAiContentId);
            }
          } catch (error) {
            console.error("[AppProvider] Error loading shared AI content:", error);
          }
        } else if (sharedAmazonContentId) {
          try {
            const sharedAmazonContentDocRef = doc(firebaseDb, `artifacts/${APP_ID}/public/sharedAmazonContent`, sharedAmazonContentId);
            const sharedAmazonContentSnap = await getDoc(sharedAmazonContentDocRef);
            if (sharedAmazonContentSnap.exists()) {
              const data = sharedAmazonContentSnap.data() as AmazonContentData;
              console.log("[AppProvider] Loaded shared Amazon content:", data);
              setInitialAmazonContent(data);
              const newUrl = new URL(window.location.href);
              newUrl.searchParams.delete('sharedAmazonContentId');
              window.history.replaceState({}, document.title, newUrl.toString());
            } else {
               console.warn("[AppProvider] Shared Amazon content ID found in URL, but no document found in Firestore:", sharedAmazonContentId);
            }
          } catch (error) {
            console.error("[AppProvider] Error loading shared Amazon AI content:", error);
          }
        }
        setIsLoadingAuth(false); // Auth state resolved, we have a user
      } else {
        console.log(
          "[AppProvider] currentUser is null. Attempting anonymous sign-in."
        );
        try {
          await signInAnonymously(firebaseAuth);
          console.log(
            "[AppProvider] Anonymous sign-in attempt finished. onAuthStateChanged will re-trigger if successful."
          );
          // If successful, onAuthStateChanged runs again, and the (currentUser) block will set isLoadingAuth = false.
          // If it fails, the catch block below will set isLoadingAuth = false.
        } catch (error) {
          console.error("[AppProvider] Anonymous sign-in failed:", error);
          setUser(null);
          setUserId(null);
          setIsLoadingAuth(false); // Auth attempt (anonymous) failed, so stop loading.
        }
      }
    });

    return () => {
      console.log("[AppProvider] Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    };
  }, []); // Empty dependency array is correct for onAuthStateChanged

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
