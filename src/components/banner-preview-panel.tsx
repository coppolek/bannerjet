
"use client";

import { useState, useEffect } from "react";
import type { BannerData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, Code, Copy, ImageOff, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface BannerPreviewPanelProps {
  bannerData: BannerData;
  isPreviewVisible: boolean;
}

export function BannerPreviewPanel({ bannerData, isPreviewVisible }: BannerPreviewPanelProps) {
  const [generatedCode, setGeneratedCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(bannerData.imageUrl);

  const { toast } = useToast();

  useEffect(() => {
    setCurrentImageUrl(bannerData.imageUrl);
    setIsImageError(false); // Reset error when image URL changes
  }, [bannerData.imageUrl]);
  
  useEffect(() => {
    // Reset image error if preview is not visible or banner data is default
    if (!isPreviewVisible) {
      setIsImageError(false);
    }
  }, [isPreviewVisible]);


  const generateCodeInternal = () => {
    const imageHeight = Math.round(bannerData.bannerHeight * 0.6);
    const contentPadding = 18;

    let borderAnimationStyle = '';
    let customCssVariables = '';

    if (bannerData.borderAnimation === 'pulse') {
      borderAnimationStyle = 'animation: pulse-border 1.5s infinite;';
    } else if (bannerData.borderAnimation === 'glow') {
      borderAnimationStyle = 'animation: glow-border 3s infinite alternate;';
      customCssVariables = `--accent-color-var: ${bannerData.accentColor};`; // Use a distinct var name
    }
    
    // Make sure to use a valid image URL, or a placeholder if error
    const displayImageUrl = isImageError ? `https://placehold.co/${bannerData.bannerWidth}x${imageHeight}.png` : bannerData.imageUrl;

    const htmlCode = `<div style="width: ${bannerData.bannerWidth}px; height: ${bannerData.bannerHeight}px; background: linear-gradient(135deg, ${bannerData.bgColor} 0%, ${bannerData.accentColor}22 100%); color: ${bannerData.textColor}; border-radius: 12px; overflow: hidden; position: relative; display: flex; flex-direction: column; font-family: var(--font-geist-sans), Arial, sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.15); transition: all 0.3s ease; cursor: pointer; ${borderAnimationStyle} ${customCssVariables}" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 15px 35px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.15)'">
  <div style="height: ${imageHeight}px; overflow: hidden; position: relative;">
    <img src="${displayImageUrl}" alt="Banner Image" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" />
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);"></div>
  </div>
  <div style="padding: ${contentPadding}px; font-size: ${bannerData.fontSize}px; flex: 1; display: flex; flex-direction: column; position: relative;">
    <div style="flex: 1; overflow: hidden; line-height: 1.4; font-weight: 500; margin-bottom: 12px;">
      ${bannerData.description}
    </div>
    <a href="${bannerData.link}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-align: center; padding: 10px 18px; background: linear-gradient(45deg, ${bannerData.accentColor}, ${bannerData.accentColor}dd); border-radius: 25px; text-decoration: none; color: white; font-size: ${Math.max(12, bannerData.fontSize - 2)}px; font-weight: 600; transition: all 0.3s ease; border: none; box-shadow: 0 4px 15px ${bannerData.accentColor}40;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px ${bannerData.accentColor}60'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px ${bannerData.accentColor}40'">
      ${bannerData.buttonText}
    </a>
  </div>
</div>`;
    setGeneratedCode(htmlCode);
    setShowCode(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      toast({ title: "Success", description: "HTML code copied to clipboard!" });
    }).catch(err => {
      toast({ variant: "destructive", title: "Error", description: "Failed to copy code." });
      console.error("Failed to copy:", err);
    });
  };
  
  const bannerStyle: React.CSSProperties = {
    width: `${bannerData.bannerWidth}px`,
    height: `${bannerData.bannerHeight}px`,
    background: `linear-gradient(135deg, ${bannerData.bgColor} 0%, ${bannerData.accentColor}22 100%)`,
    color: bannerData.textColor,
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  if (bannerData.borderAnimation === 'pulse') {
    bannerStyle.animation = 'pulse-border 1.5s infinite';
  } else if (bannerData.borderAnimation === 'glow') {
    bannerStyle.animation = 'glow-border 3s infinite alternate';
    // @ts-ignore
    bannerStyle['--accent-color-var'] = bannerData.accentColor;
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Eye className="mr-3 h-8 w-8 text-primary" />
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center mb-6 min-h-[300px] bg-muted/30 p-4 rounded-lg border border-dashed">
          {isPreviewVisible ? (
            <div
              style={bannerStyle}
              className="hover:transform hover:-translate-y-1 hover:shadow-2xl"
              data-ai-hint="advertisement banner"
            >
              <div style={{ height: `${Math.round(bannerData.bannerHeight * 0.6)}px`, overflow: "hidden", position: "relative" }}>
                {!isImageError ? (
                   <Image
                    src={currentImageUrl}
                    alt="Banner Preview"
                    width={bannerData.bannerWidth}
                    height={Math.round(bannerData.bannerHeight * 0.6)}
                    style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
                    className="hover:scale-105"
                    onError={() => setIsImageError(true)}
                    unoptimized={true} // Useful for external URLs that might not be in next.config.js images.remotePatterns
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground">
                    <ImageOff className="w-12 h-12 mb-2" />
                    <p className="text-sm">Image not available</p>
                    <p className="text-xs"> (URL: {bannerData.imageUrl.substring(0,30)}...)</p>
                  </div>
                )}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)" }}></div>
              </div>
              <div style={{ padding: "18px", fontSize: `${bannerData.fontSize}px`, flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
                <div style={{ flex: 1, overflow: "hidden", lineHeight: "1.4", fontWeight: "500", marginBottom: "12px" }}>
                  {bannerData.description}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    textAlign: "center",
                    padding: "10px 18px",
                    background: `linear-gradient(45deg, ${bannerData.accentColor}, ${bannerData.accentColor}dd)`,
                    borderRadius: "25px",
                    textDecoration: "none",
                    color: "white", // Assuming button text is white, adjust if needed
                    fontSize: `${Math.max(12, bannerData.fontSize - 2)}px`,
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    border: "none",
                    boxShadow: `0 4px 15px ${bannerData.accentColor}40`,
                  }}
                  className="hover:transform hover:-translate-y-px"
                >
                  {bannerData.buttonText}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-center">Click "Generate Banner" to<br/>see the preview.</p>
            </div>
          )}
        </div>

        {isPreviewVisible && (
          <div className="space-y-4">
            <Button
              onClick={generateCodeInternal}
              className="w-full"
              variant="outline"
            >
              <Code className="mr-2 h-5 w-5" /> Generate HTML Code
            </Button>

            {showCode && (
              <div className="bg-muted/50 rounded-xl p-4 border">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-foreground">Banner HTML Code:</h3>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="ghost"
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                </div>
                <Textarea
                  value={generatedCode}
                  readOnly
                  className="w-full h-32 p-3 bg-background font-mono text-xs leading-relaxed"
                  style={{ resize: "vertical" }}
                />
                <p className="text-xs text-muted-foreground mt-2 bg-background p-2 rounded">
                  💡 Tip: The banner includes hover animations and responsive image handling!
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

