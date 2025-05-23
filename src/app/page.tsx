
"use client";

import React, { useState, useEffect, type ChangeEvent } from 'react';
import { BannerCustomizationPanel } from '@/components/banner-customization-panel';
import { BannerPreviewPanel } from '@/components/banner-preview-panel';
import { AiFeaturesPanel } from '@/components/ai-features-panel';
import { SavedBannersPanel } from '@/components/saved-banners-panel';
import { ShareModal } from '@/components/share-modal';
import { Button } from "@/components/ui/button";
import { Loader2, LayoutGrid } from "lucide-react";
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
  const { userId, isLoadingAuth, appId, initialAiContent, initialAmazonContent } = useApp();
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
          toast({ variant: "destructive", title: "Error", description: "Failed to load saved banners." });
          setIsLoadingBanners(false);
        }
      );
      return () => unsubscribe();
    } else {
      setSavedBanners([]);
      setIsLoadingBanners(false);
    }
  }, [userId, toast]);

  // Effect to load shared content if available from AppProvider
  useEffect(() => {
    if (initialAiContent) {
      // Logic to integrate initialAiContent into the AI Features Panel state
      // This might involve passing down setters or using a more complex state management
      toast({ title: "Shared Content Loaded", description: "AI content has been loaded from the shared link." });
      // Example: if AiFeaturesPanel managed its own state internally, you'd need a way to set it.
      // For now, we can assume page.tsx controls parts of this or AiFeaturesPanel handles it.
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
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be signed in to save banners." });
      return;
    }
    try {
      await saveBannerToFirestore(userId, bannerData);
      toast({ title: "Success", description: "Banner saved successfully!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save banner." });
      console.error("Error saving banner:", error);
    }
  };

  const handleLoadBanner = (bannerToLoad: SavedBannerData) => {
    setBannerData({ ...bannerToLoad });
    setPreviewVisible(true);
    toast({ title: "Banner Loaded", description: `Loaded: ${bannerToLoad.description || 'banner'}` });
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!userId) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be signed in to delete banners." });
      return;
    }
    try {
      await deleteBannerFromFirestore(userId, bannerId);
      toast({ title: "Success", description: "Banner deleted successfully!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete banner." });
      console.error("Error deleting banner:", error);
    }
  };
  
  const handleApplyBannerIdea = (idea: BannerIdea) => {
    setBannerData(prev => ({
      ...prev,
      description: idea.descriptionSuggestion,
      buttonText: idea.ctaSuggestion,
    }));
    // Potentially set image URL based on visualConcept if image generation from concept existed
    // setBannerData(prev => ({ ...prev, imageUrl: `https://placehold.co/600x300.png?text=${encodeURIComponent(idea.visualConcept)}`}));
    toast({ title: "Idea Applied!", description: `Applied "${idea.ideaName}" to banner settings.` });
    setPreviewVisible(true); // Auto-generate preview when idea is applied
  };

  const handleShareContent = async (type: "general" | "amazon", data: any) => {
    if (!userId) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be signed in to share content." });
      return;
    }
    try {
      let docId = "";
      let shareParam = "";

      if (type === "general") {
        docId = await shareAiContentToFirestore(userId, data as Omit<AiContentData, 'id' | 'sharedBy' | 'sharedAt'>);
        shareParam = "sharedAiContentId";
      } else { // amazon
        docId = await shareAmazonContentToFirestore(userId, data as Omit<AmazonContentData, 'id' | 'sharedBy' | 'sharedAt'>);
        shareParam = "sharedAmazonContentId";
      }
      
      const shareableLink = `${window.location.origin}${window.location.pathname}?${shareParam}=${docId}`;
      setCurrentShareUrl(shareableLink);
      setShowShareModal(true);
      toast({ title: "Content Ready to Share!", description: "Link generated for sharing." });

    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to share content." });
      console.error("Error sharing content:", error);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading BannerForge AI...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4 md:p-8">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3">
          BannerForge AI
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Craft stunning, AI-powered banners and marketing content with ease.
        </p>
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
            userId={userId}
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
    </div>
  );
}
