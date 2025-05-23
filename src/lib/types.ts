
export type BannerPlatform = "blog" | "facebook" | "x" | "telegram";

export interface BannerData {
  id?: string;
  imageUrl: string;
  description: string;
  link: string;
  bgColor: string;
  textColor: string;
  fontSize: number;
  accentColor: string;
  buttonText: string;
  bannerWidth: number;
  bannerHeight: number;
  borderAnimation?: "none" | "pulse" | "glow";
  createdAt?: string;
}

export interface SavedBannerData extends BannerData {
  id: string;
}

export interface BannerIdea {
  ideaName: string;
  descriptionSuggestion: string;
  ctaSuggestion: string;
  visualConcept: string;
}

export interface AiContentData {
  id?: string;
  prompt: string;
  content: string;
  imageUrl: string; // User provided or previously generated and stored
  platform: BannerPlatform;
  externalLink?: string;
  sharedBy?: string;
  sharedAt?: string;
  htmlOutput?: string; // Stored combined HTML for shared content
}

export interface AmazonContentData {
  id?: string;
  prompt: string;
  content: string; // Raw AI generated text
  productImageUrl: string;
  affiliateLink: string;
  platform: BannerPlatform;
  htmlOutput?: string; // Stored combined HTML for shared content
  sharedBy?: string;
  sharedAt?: string;
}

// Default values
export const defaultBannerData: BannerData = {
  imageUrl: "https://placehold.co/300x150.png",
  description: "Discover the future of digital design",
  link: "https://example.com",
  bgColor: "#1a1a2e",
  textColor: "#ffffff",
  fontSize: 14,
  accentColor: "#ff6b6b",
  buttonText: "Discover more →",
  bannerWidth: 300,
  bannerHeight: 300,
  borderAnimation: "none",
};
