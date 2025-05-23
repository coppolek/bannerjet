
"use client";

import type { ChangeEvent } from "react";
import type { BannerData } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Image as ImageIcon, TextCursorInput, Link2, PaletteIcon, Wand2, Save, VenetianMask, Clapperboard } from "lucide-react";

interface BannerCustomizationPanelProps {
  bannerData: BannerData;
  onInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onGenerateBanner: () => void;
  onSaveBanner: () => void;
  isUserAuthenticated: boolean;
}

export function BannerCustomizationPanel({
  bannerData,
  onInputChange,
  onGenerateBanner,
  onSaveBanner,
  isUserAuthenticated,
}: BannerCustomizationPanelProps) {
  
  const handleColorInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange(e);
  };

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <VenetianMask className="mr-3 h-8 w-8 text-primary" />
          Customize Design
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bannerWidth" className="font-semibold">Width (px)</Label>
            <Input
              id="bannerWidth"
              type="number"
              name="bannerWidth"
              value={bannerData.bannerWidth}
              onChange={onInputChange}
              min="100"
              max="1000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bannerHeight" className="font-semibold">Height (px)</Label>
            <Input
              id="bannerHeight"
              type="number"
              name="bannerHeight"
              value={bannerData.bannerHeight}
              onChange={onInputChange}
              min="100"
              max="1000"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="borderAnimation" className="font-semibold">Border Animation</Label>
          <Select
            name="borderAnimation"
            value={bannerData.borderAnimation}
            onValueChange={(value) => onInputChange({ target: { name: "borderAnimation", value } } as any)}
          >
            <SelectTrigger id="borderAnimation" className="mt-1">
              <SelectValue placeholder="Select animation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="pulse">Pulse</SelectItem>
              <SelectItem value="glow">Glow</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Add animation to the banner border.</p>
        </div>
        
        <div>
          <Label htmlFor="imageUrl" className="font-semibold flex items-center">
            <ImageIcon className="mr-2 h-4 w-4" /> Image URL
          </Label>
          <Input
            id="imageUrl"
            type="text"
            name="imageUrl"
            value={bannerData.imageUrl}
            onChange={onInputChange}
            placeholder="Enter image URL"
            className="mt-1"
            data-ai-hint="banner background"
          />
          <p className="text-xs text-muted-foreground mt-1">Example: https://placehold.co/600x300.png</p>
        </div>

        <div>
          <Label htmlFor="description" className="font-semibold flex items-center">
            <TextCursorInput className="mr-2 h-4 w-4" /> Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={bannerData.description}
            onChange={onInputChange}
            placeholder="Enter captivating description"
            className="mt-1 h-20 resize-none"
          />
        </div>

        <div>
          <Label htmlFor="buttonText" className="font-semibold">Button Text</Label>
          <Input
            id="buttonText"
            type="text"
            name="buttonText"
            value={bannerData.buttonText}
            onChange={onInputChange}
            placeholder="e.g., Buy Now, Learn More"
            className="mt-1"
          />
           <p className="text-xs text-muted-foreground mt-1">💡 Try: "Buy Now →", "Register Free", "Discover Offer"</p>
        </div>

        <div>
          <Label htmlFor="link" className="font-semibold flex items-center">
            <Link2 className="mr-2 h-4 w-4" /> Destination Link
          </Label>
          <Input
            id="link"
            type="text"
            name="link"
            value={bannerData.link}
            onChange={onInputChange}
            placeholder="https://yoursite.com"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bgColor" className="font-semibold flex items-center">
              <Palette className="mr-2 h-4 w-4" /> Main Color
            </Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="bgColor"
                type="color"
                name="bgColor"
                value={bannerData.bgColor}
                onChange={handleColorInputChange}
                className="w-12 h-12 p-1"
              />
              <Input
                type="text"
                name="bgColor"
                value={bannerData.bgColor}
                onChange={onInputChange}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="accentColor" className="font-semibold flex items-center">
              <PaletteIcon className="mr-2 h-4 w-4" /> Accent Color
            </Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="accentColor"
                type="color"
                name="accentColor"
                value={bannerData.accentColor}
                onChange={handleColorInputChange}
                className="w-12 h-12 p-1"
              />
              <Input
                type="text"
                name="accentColor"
                value={bannerData.accentColor}
                onChange={onInputChange}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        <div>
          <Label htmlFor="textColor" className="font-semibold flex items-center">
            <Palette className="mr-2 h-4 w-4" /> Text Color
          </Label>
          <div className="flex items-center space-x-2 mt-1">
            <Input
              id="textColor"
              type="color"
              name="textColor"
              value={bannerData.textColor}
              onChange={handleColorInputChange}
              className="w-12 h-12 p-1"
            />
            <Input
              type="text"
              name="textColor"
              value={bannerData.textColor}
              onChange={onInputChange}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="fontSize" className="font-semibold">Text Size: {bannerData.fontSize}px</Label>
          <Slider
            id="fontSize"
            name="fontSize"
            value={[bannerData.fontSize]}
            onValueChange={(value) => onInputChange({ target: { name: "fontSize", value: value[0] } } as any)}
            min={10}
            max={24}
            step={1}
            className="w-full mt-2 slider"
          />
        </div>

        <Button
          onClick={onGenerateBanner}
          className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
          size="lg"
        >
          <Clapperboard className="mr-2 h-5 w-5" /> Generate Banner
        </Button>

        <Button
          onClick={onSaveBanner}
          variant="outline"
          className="w-full"
          size="lg"
          disabled={!isUserAuthenticated}
        >
          <Save className="mr-2 h-5 w-5" /> Save Banner
        </Button>
      </CardContent>
    </Card>
  );
}
