
"use client";

import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateBannerIdeas, type GenerateBannerIdeasInput, type GenerateBannerIdeasOutput } from "@/ai/flows/generate-banner-ideas-flow";
import { generateGeneralContent, type GenerateGeneralContentInput, type GenerateGeneralContentOutput } from "@/ai/flows/generate-general-content";
import { generateAmazonContent, type GenerateAmazonContentInput, type GenerateAmazonContentOutput } from "@/ai/flows/generate-amazon-content";
import type { BannerData, BannerIdea, BannerPlatform } from "@/lib/types";
import { Loader2, Lightbulb, ScrollText, ShoppingCart, Share2, Copy, WandSparkles, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface AiFeaturesPanelProps {
  userId: string | null;
  appId: string;
  onApplyBannerIdea: (idea: BannerIdea) => void;
  onShareContent: (type: "general" | "amazon", data: any) => Promise<void>;
}

export function AiFeaturesPanel({ userId, appId, onApplyBannerIdea, onShareContent }: AiFeaturesPanelProps) {
  const { toast } = useToast();

  // Banner Ideas State
  const [aiBannerIdeaPrompt, setAiBannerIdeaPrompt] = useState("");
  const [generatedBannerIdeas, setGeneratedBannerIdeas] = useState<GenerateBannerIdeasOutput>([]);
  const [isGeneratingBannerIdeas, setIsGeneratingBannerIdeas] = useState(false);

  // General Content State
  const [aiContentPrompt, setAiContentPrompt] = useState("");
  const [generatedAiContent, setGeneratedAiContent] = useState("");
  const [generalContentImageUrl, setGeneralContentImageUrl] = useState(""); // User-provided image URL
  const [isGeneratingContentAi, setIsGeneratingContentAi] = useState(false);
  const [aiOutputHtml, setAiOutputHtml] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<BannerPlatform>('blog');
  const [externalLink, setExternalLink] = useState("");

  // Amazon Content State
  const [aiAmazonContentPrompt, setAiAmazonContentPrompt] = useState("");
  const [amazonProductImageUrl, setAmazonProductImageUrl] = useState("");
  const [amazonAffiliateLink, setAmazonAffiliateLink] = useState("");
  const [generatedAiAmazonContent, setGeneratedAiAmazonContent] = useState("");
  const [amazonOutputHtml, setAmazonOutputHtml] = useState("");
  const [isGeneratingAmazonContentAi, setIsGeneratingAmazonContentAi] = useState(false);
  const [selectedAmazonPlatform, setSelectedAmazonPlatform] = useState<BannerPlatform>('blog');
  const [isAmazonImageError, setIsAmazonImageError] = useState(false);

  const handleGenerateBannerIdeas = async () => {
    if (!aiBannerIdeaPrompt.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a prompt for banner ideas." });
      return;
    }
    setIsGeneratingBannerIdeas(true);
    setGeneratedBannerIdeas([]);
    try {
      const ideas = await generateBannerIdeas({ prompt: aiBannerIdeaPrompt });
      setGeneratedBannerIdeas(ideas);
      toast({ title: "Success", description: "Banner ideas generated!" });
    } catch (error) {
      console.error("Error generating banner ideas:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate banner ideas." });
    } finally {
      setIsGeneratingBannerIdeas(false);
    }
  };

  const updateAiOutputHtml = (textContent: string, imageUrl: string, platform: BannerPlatform) => {
    let html = "";
    if (platform) {
      html += `<h4 style="font-size: 1.1em; font-weight: 600; color: #333; margin-bottom: 0.5em;">Content for ${platform.charAt(0).toUpperCase() + platform.slice(1)}:</h4>`;
    }
    if (textContent) {
      // Simple paragraph formatting, replace newlines with <br>
      const formattedTextContent = textContent.replace(/\n/g, '<br />');
      html += `<div style="margin-bottom: 1em; line-height: 1.6;">${formattedTextContent}</div>`;
    }
    if (imageUrl) {
      html += `<div style="margin-top: 1rem; text-align: center;"><img src="${imageUrl}" alt="AI Generated Visual" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" data-ai-hint="illustration digital art"/></div>`;
    }
    setAiOutputHtml(html);
  };
  
  const handleGenerateGeneralContent = async () => {
    if (!aiContentPrompt.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a prompt for content generation." });
      return;
    }
    setIsGeneratingContentAi(true);
    try {
      const input: GenerateGeneralContentInput = { 
        prompt: aiContentPrompt, 
        platform: selectedPlatform,
        ...(externalLink && { externalLink }) 
      };
      const result = await generateGeneralContent(input);
      setGeneratedAiContent(result.content);
      updateAiOutputHtml(result.content, generalContentImageUrl, selectedPlatform);
      toast({ title: "Success", description: "AI content generated!" });
    } catch (error) {
      console.error("Error generating general AI content:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate AI content." });
    } finally {
      setIsGeneratingContentAi(false);
    }
  };

  useEffect(() => {
    updateAiOutputHtml(generatedAiContent, generalContentImageUrl, selectedPlatform);
  }, [generalContentImageUrl, generatedAiContent, selectedPlatform]);


  const updateAmazonOutputHtml = (textContent: string, imageUrl: string, affLink: string, platform: BannerPlatform) => {
    let html = "";
    if (platform) {
      html += `<h4 style="font-size: 1.1em; font-weight: 600; color: #333; margin-bottom: 0.5em;">Content for ${platform.charAt(0).toUpperCase() + platform.slice(1)}:</h4>`;
    }
    if (imageUrl) {
      html += `<div style="margin-bottom: 1rem; text-align: center;">
                  <img src="${isAmazonImageError ? `https://placehold.co/200x200.png` : imageUrl}" alt="Amazon Product Image" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 200px; max-height: 200px; object-fit: contain;" data-ai-hint="product photo"/>
               </div>`;
    }
    if (textContent) {
      const formattedTextContent = textContent.replace(/\n/g, '<br />');
      html += `<div style="margin-bottom: 1em; line-height: 1.6;">${formattedTextContent}</div>`;
    }
    if (affLink) {
      html += `<div style="margin-top: 1.5rem; text-align: center;">
                  <a href="${affLink}" target="_blank" rel="noopener noreferrer" 
                     style="display: inline-block; padding: 10px 20px; background-color: #FF9900; color: white; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 1em; box-shadow: 0 4px 15px rgba(255,153,0,0.4); transition: all 0.3s ease;">
                     Buy on Amazon
                  </a>
               </div>`;
    }
    setAmazonOutputHtml(html);
  };

  const handleGenerateAmazonContent = async () => {
    if (!aiAmazonContentPrompt.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a prompt for Amazon content." });
      return;
    }
    if (!amazonAffiliateLink.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter your Amazon affiliate link." });
      return;
    }
    setIsGeneratingAmazonContentAi(true);
    try {
      const input: GenerateAmazonContentInput = {
        prompt: `Product: ${aiAmazonContentPrompt}. Image available at: ${amazonProductImageUrl || 'No image provided.'}`,
        affiliateLink: amazonAffiliateLink,
        platform: selectedAmazonPlatform,
      };
      const result = await generateAmazonContent(input);
      setGeneratedAiAmazonContent(result.content);
      updateAmazonOutputHtml(result.content, amazonProductImageUrl, amazonAffiliateLink, selectedAmazonPlatform);
      toast({ title: "Success", description: "Amazon AI content generated!" });
    } catch (error) {
      console.error("Error generating Amazon AI content:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate Amazon AI content." });
    } finally {
      setIsGeneratingAmazonContentAi(false);
    }
  };
  
  useEffect(() => {
     updateAmazonOutputHtml(generatedAiAmazonContent, amazonProductImageUrl, amazonAffiliateLink, selectedAmazonPlatform);
  }, [amazonProductImageUrl, generatedAiAmazonContent, amazonAffiliateLink, selectedAmazonPlatform, isAmazonImageError]);


  const copyHtmlToClipboard = (htmlContent: string, type: string) => {
    navigator.clipboard.writeText(htmlContent).then(() => {
      toast({ title: "Success", description: `${type} HTML copied to clipboard!` });
    }).catch(err => {
      toast({ variant: "destructive", title: "Error", description: `Failed to copy ${type} HTML.` });
    });
  };

  const handleShareGeneralContent = () => {
    if (!generatedAiContent && !generalContentImageUrl) {
      toast({ variant: "destructive", title: "Error", description: "No general AI content to share." });
      return;
    }
    onShareContent("general", {
      prompt: aiContentPrompt,
      content: generatedAiContent,
      imageUrl: generalContentImageUrl,
      platform: selectedPlatform,
      externalLink,
      htmlOutput: aiOutputHtml,
    });
  };

  const handleShareAmazonContent = () => {
    if (!generatedAiAmazonContent) {
      toast({ variant: "destructive", title: "Error", description: "No Amazon AI content to share." });
      return;
    }
    onShareContent("amazon", {
      prompt: aiAmazonContentPrompt,
      content: generatedAiAmazonContent,
      productImageUrl: amazonProductImageUrl,
      affiliateLink: amazonAffiliateLink,
      platform: selectedAmazonPlatform,
      htmlOutput: amazonOutputHtml,
    });
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <WandSparkles className="mr-3 h-8 w-8 text-primary" />
          AI Content Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="banner-ideas">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="banner-ideas"><Lightbulb className="mr-2 h-4 w-4 inline-block" />Banner Ideas</TabsTrigger>
            <TabsTrigger value="general-content"><ScrollText className="mr-2 h-4 w-4 inline-block" />General Content</TabsTrigger>
            <TabsTrigger value="amazon-content"><ShoppingCart className="mr-2 h-4 w-4 inline-block" />Amazon Content</TabsTrigger>
          </TabsList>

          {/* AI Banner Idea Generator */}
          <TabsContent value="banner-ideas">
            <Card>
              <CardHeader>
                <CardTitle>AI Banner Idea Generator</CardTitle>
                <CardDescription>Get creative concepts for your next banner campaign.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="aiBannerIdeaPrompt">Banner Idea Prompt</Label>
                  <Input
                    id="aiBannerIdeaPrompt"
                    value={aiBannerIdeaPrompt}
                    onChange={(e) => setAiBannerIdeaPrompt(e.target.value)}
                    placeholder="e.g., new smartphone, online yoga course"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Describe the theme or product.</p>
                </div>
                <Button onClick={handleGenerateBannerIdeas} disabled={isGeneratingBannerIdeas} className="w-full">
                  {isGeneratingBannerIdeas && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Ideas
                </Button>
                {generatedBannerIdeas.length > 0 && (
                  <div className="mt-4 space-y-3 max-h-96 overflow-y-auto p-1">
                    <h4 className="font-semibold">Generated Ideas:</h4>
                    {generatedBannerIdeas.map((idea, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="p-4 space-y-1">
                          <p className="font-bold text-sm">{idea.ideaName}</p>
                          <p className="text-xs"><strong>Description:</strong> {idea.descriptionSuggestion}</p>
                          <p className="text-xs"><strong>CTA:</strong> {idea.ctaSuggestion}</p>
                          <p className="text-xs"><strong>Visual:</strong> {idea.visualConcept}</p>
                          <Button size="sm" variant="outline" onClick={() => onApplyBannerIdea(idea as BannerIdea)} className="mt-2">
                            Apply Idea
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generic AI Content Generator */}
          <TabsContent value="general-content">
            <Card>
              <CardHeader>
                <CardTitle>Generic AI Content Generator</CardTitle>
                <CardDescription>Create text content for various platforms.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="selectedPlatform">Target Platform</Label>
                  <Select value={selectedPlatform} onValueChange={(value: BannerPlatform) => setSelectedPlatform(value)}>
                    <SelectTrigger id="selectedPlatform" className="mt-1">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="facebook">Facebook Post</SelectItem>
                      <SelectItem value="x">X (Twitter) Post</SelectItem>
                      <SelectItem value="telegram">Telegram Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="aiContentPrompt">Content Prompt</Label>
                  <Textarea
                    id="aiContentPrompt"
                    value={aiContentPrompt}
                    onChange={(e) => setAiContentPrompt(e.target.value)}
                    placeholder="e.g., write a paragraph about design, blog ideas, email text"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="generalContentImageUrl">Image URL (Optional)</Label>
                  <Input
                    id="generalContentImageUrl"
                    value={generalContentImageUrl}
                    onChange={(e) => setGeneralContentImageUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="mt-1"
                    data-ai-hint="background abstract"
                  />
                </div>
                <div>
                  <Label htmlFor="externalLink">External Link (Optional)</Label>
                  <Input
                    id="externalLink"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://your-link.com"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleGenerateGeneralContent} disabled={isGeneratingContentAi} className="w-full">
                  {isGeneratingContentAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Content
                </Button>
                {(generatedAiContent || generalContentImageUrl) && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Generated AI Output:</h4>
                     <div className="border rounded-md p-3 bg-muted/30 max-h-96 overflow-y-auto text-sm" dangerouslySetInnerHTML={{ __html: aiOutputHtml }} />
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => copyHtmlToClipboard(aiOutputHtml, "General AI")}>
                        <Copy className="mr-2 h-4 w-4" /> Copy HTML
                      </Button>
                       <Button variant="outline" size="sm" onClick={handleShareGeneralContent} disabled={!userId}>
                        <Share2 className="mr-2 h-4 w-4" /> Share
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Amazon AI Content Generator */}
          <TabsContent value="amazon-content">
            <Card>
              <CardHeader>
                <CardTitle>Amazon AI Content Generator</CardTitle>
                <CardDescription>Generate product descriptions and ad copy with affiliate links.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                  <Label htmlFor="selectedAmazonPlatform">Target Platform</Label>
                  <Select value={selectedAmazonPlatform} onValueChange={(value: BannerPlatform) => setSelectedAmazonPlatform(value)}>
                    <SelectTrigger id="selectedAmazonPlatform" className="mt-1">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="facebook">Facebook Post</SelectItem>
                      <SelectItem value="x">X (Twitter) Post</SelectItem>
                      <SelectItem value="telegram">Telegram Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amazonProductImageUrl">Product Image URL</Label>
                  <Input
                    id="amazonProductImageUrl"
                    value={amazonProductImageUrl}
                    onChange={(e) => {setAmazonProductImageUrl(e.target.value); setIsAmazonImageError(false);}}
                    placeholder="https://example.com/product.jpg"
                    className="mt-1"
                    data-ai-hint="ecommerce product"
                  />
                   {amazonProductImageUrl && <Image src={isAmazonImageError ? `https://placehold.co/100x100.png` : amazonProductImageUrl} alt="Amazon Product Thumbnail" width={100} height={100} className="mt-2 rounded border object-contain" onError={() => setIsAmazonImageError(true)} data-ai-hint="product package"/>}
                </div>
                <div>
                  <Label htmlFor="amazonAffiliateLink">Affiliate Link</Label>
                  <Input
                    id="amazonAffiliateLink"
                    value={amazonAffiliateLink}
                    onChange={(e) => setAmazonAffiliateLink(e.target.value)}
                    placeholder="https://amzn.to/your-affiliate-link"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="aiAmazonContentPrompt">Amazon Content Prompt</Label>
                  <Textarea
                    id="aiAmazonContentPrompt"
                    value={aiAmazonContentPrompt}
                    onChange={(e) => setAiAmazonContentPrompt(e.target.value)}
                    placeholder="e.g., description for 'wireless headphones', bullet points for 'yoga mat'"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleGenerateAmazonContent} disabled={isGeneratingAmazonContentAi} className="w-full">
                  {isGeneratingAmazonContentAi && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Amazon Content
                </Button>
                {generatedAiAmazonContent && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Generated Amazon AI Output:</h4>
                    <div className="border rounded-md p-3 bg-muted/30 max-h-96 overflow-y-auto text-sm" dangerouslySetInnerHTML={{ __html: amazonOutputHtml }} />
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => copyHtmlToClipboard(amazonOutputHtml, "Amazon AI")}>
                        <Copy className="mr-2 h-4 w-4" /> Copy HTML
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleShareAmazonContent} disabled={!userId}>
                        <Share2 className="mr-2 h-4 w-4" /> Share
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
