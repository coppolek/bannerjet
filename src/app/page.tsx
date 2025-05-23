
"use client";

import React, { useState, useEffect, type ChangeEvent } from 'react';
import { BannerCustomizationPanel } from '@/components/banner-customization-panel';
import { BannerPreviewPanel } from '@/components/banner-preview-panel';
import { AiFeaturesPanel } from '@/components/ai-features-panel';
import { SavedBannersPanel } from '@/components/saved-banners-panel';
import { ShareModal } from '@/components/share-modal';
import { AuthModal } from '@/components/auth-modal';
import { Button } from "@/components/ui/button";
import { Loader2, UserCircle, LogIn, LogOut, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { useApp } from "@/providers/app-provider";
import { useToast } from "@/hooks/use-toast";
import type { BannerData, SavedBannerData, BannerIdea, AiContentData, AmazonContentData } from "@/lib/types";
import { defaultBannerData } from "@/lib/types";
import { 
  saveBannerToFirestore, 
  getUserBanners, 
  deleteBannerFromFirestore,
  shareAiContentToFirestore,
  shareAmazonContentToFirestore
} from '@/lib/firebase-service';

export default function BannerGeneratorPage() {
  const { 
    userId, 
    userEmail,
    isLoadingAuth, 
    isAdmin, // Get admin status
    isLoadingAdminStatus, // Get admin status loading state
    appId, 
    initialAiContent, 
    initialAmazonContent,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    handleSignOut
  } = useApp();
  const { toast } = useToast();

  const [bannerData, setBannerData] = useState<BannerData>(defaultBannerData);
  const [isPreviewVisible, setPreviewVisible] = useState(false);
  
  const [savedBanners, setSavedBanners] = useState<SavedBannerData[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);

  const [showShareModal, setShowShareModal] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState('');

  useEffect(() => {
    if (userId) {
      setIsLoadingBanners(true);
      const unsubscribe = getUserBanners(
        userId,
        (banners) => {
          setSavedBanners(banners);
          setIsLoadingBanners(false);
        },
        (error) => {
          console.error("[Page] Error loading saved banners:", error);
          toast({ variant: "destructive", title: "Error Loading Banners", description: "Could not fetch your saved banners. Please try again later." });
          setIsLoadingBanners(false);
        }
      );
      return () => unsubscribe();
    } else {
      setSavedBanners([]); // Clear banners if user logs out
      setIsLoadingBanners(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (initialAiContent) {
      toast({ title: "Shared Content Loaded", description: "AI content has been loaded from the shared link." });
    }
    if (initialAmazonContent) {
      toast({ title: "Shared Content Loaded", description: "Amazon AI content has been loaded." });
    }
  }, [initialAiContent, initialAmazonContent, toast]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseInt(value) : value;
    setBannerData(prevData => ({ ...prevData, [name]: val }));
  };

  const handleGenerateBanner = () => {
    setPreviewVisible(true);
  };

  const handleSaveBanner = async () => {
    if (!userId) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please log in or register to save banners." });
      openAuthModal();
      return;
    }
    try {
      await saveBannerToFirestore(userId, bannerData);
      toast({ title: "Success", description: "Banner saved successfully!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error Saving Banner", description: (error as Error).message || "Failed to save banner." });
      console.error("[Page] Error saving banner:", error);
    }
  };

  const handleLoadBanner = (bannerToLoad: SavedBannerData) => {
    setBannerData({ ...bannerToLoad });
    setPreviewVisible(true);
    toast({ title: "Banner Loaded", description: `Loaded: ${bannerToLoad.description || 'banner'}` });
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!userId) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please log in or register to delete banners." });
      openAuthModal();
      return;
    }
    try {
      await deleteBannerFromFirestore(userId, bannerId);
      toast({ title: "Success", description: "Banner deleted successfully!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error Deleting Banner", description: (error as Error).message || "Failed to delete banner." });
      console.error("[Page] Error deleting banner:", error);
    }
  };
  
  const handleApplyBannerIdea = (idea: BannerIdea) => {
    setBannerData(prev => ({
      ...prev,
      description: idea.descriptionSuggestion,
      buttonText: idea.ctaSuggestion,
    }));
    toast({ title: "Idea Applied!", description: `Applied "${idea.ideaName}" to banner settings.` });
    setPreviewVisible(true); 
  };

  const handleShareContent = async (type: "general" | "amazon", data: any) => {
    console.log("[Page handleShareContent] Initiated. Type:", type, "User ID:", userId, "App ID:", appId);
    if (!userId) {
      console.warn("[Page handleShareContent] User ID is null. Aborting share. User must be authenticated.");
      toast({ variant: "destructive", title: "Authentication Required", description: "Please log in or register to share content." });
      openAuthModal();
      return;
    }
    try {
      console.log("[Page handleShareContent] Attempting to save to Firestore. Data:", data);
      let docId = "";
      let shareParam = "";

      if (type === "general") {
        docId = await shareAiContentToFirestore(userId, data as Omit<AiContentData, 'id' | 'sharedBy' | 'sharedAt'>);
        shareParam = "sharedAiContentId";
      } else { // amazon
        docId = await shareAmazonContentToFirestore(userId, data as Omit<AmazonContentData, 'id' | 'sharedBy' | 'sharedAt'>);
        shareParam = "sharedAmazonContentId";
      }
      console.log("[Page handleShareContent] Firestore save successful. Doc ID:", docId);
      
      const shareableLink = `${window.location.origin}${window.location.pathname}?${shareParam}=${docId}`;
      console.log("[Page handleShareContent] Generated shareable link:", shareableLink);
      setCurrentShareUrl(shareableLink);
      setShowShareModal(true);
      toast({ title: "Content Ready to Share!", description: "Link generated for sharing." });
      console.log("[Page handleShareContent] Share modal should be visible.");

    } catch (error: any) {
      console.error("[Page handleShareContent] Error during sharing process. Raw error object:", error);
      let errorMessage = "An unknown error occurred while sharing.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
      }
      toast({ variant: "destructive", title: "Error Sharing Content", description: errorMessage });
    }
  };

  if (isLoadingAuth || isLoadingAdminStatus) { // Check both loading states
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {isLoadingAuth ? "Checking Authentication..." : "Checking Admin Status..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <header className="flex flex-col items-center mb-6">
        <div className="w-full flex justify-end items-center mb-2 pr-4 md:pr-8">
          {userId && userEmail ? (
            <div className="flex items-center space-x-3">
              {isAdmin && (
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Admin
                </span>
              )}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Logged in as: <strong className="text-foreground">{userEmail}</strong>
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={openAuthModal}>
              <LogIn className="mr-2 h-4 w-4" />
              Login / Register
            </Button>
          )}
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-1">
          BannerForge AI
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-center">
          Craft stunning, AI-powered banners and marketing content with ease.
        </p>
        {!userId && (
           <div className="mt-3 p-2 text-sm bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md flex items-center">
             <AlertTriangle className="h-4 w-4 mr-2 shrink-0" />
             <span>Not Authenticated. Login/Register to save banners and share content. Sharing will be disabled.</span>
           </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <BannerCustomizationPanel
            bannerData={bannerData}
            onInputChange={handleInputChange}
            onGenerateBanner={handleGenerateBanner}
            onSaveBanner={handleSaveBanner}
            isUserAuthenticated={!!userId}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <BannerPreviewPanel
            bannerData={bannerData}
            isPreviewVisible={isPreviewVisible}
          />
           <SavedBannersPanel
            savedBanners={savedBanners}
            isLoadingBanners={isLoadingBanners}
            onLoadBanner={handleLoadBanner}
            onDeleteBanner={handleDeleteBanner}
          />
        </div>
        
        <div className="lg:col-span-3">
           <AiFeaturesPanel 
            userId={userId} // Pass userId
            appId={appId}
            onApplyBannerIdea={handleApplyBannerIdea}
            onShareContent={handleShareContent}
           />
        </div>
      </main>
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={currentShareUrl}
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
}

    