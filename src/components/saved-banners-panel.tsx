
"use client";

import type { SavedBannerData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListChecks, Trash2, Download, Library } from "lucide-react";

interface SavedBannersPanelProps {
  savedBanners: SavedBannerData[];
  isLoadingBanners: boolean;
  onLoadBanner: (banner: SavedBannerData) => void;
  onDeleteBanner: (bannerId: string) => void;
}

export function SavedBannersPanel({
  savedBanners,
  isLoadingBanners,
  onLoadBanner,
  onDeleteBanner,
}: SavedBannersPanelProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Library className="mr-3 h-8 w-8 text-primary" />
          Your Saved Banners
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingBanners ? (
          <div className="text-center text-muted-foreground py-8">Loading banners...</div>
        ) : savedBanners.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No banners saved yet. Create and save your first banner!
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-4">
              {savedBanners.map((banner) => (
                <Card key={banner.id} className="bg-muted/30">
                  <CardContent className="p-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate flex-grow mr-4">
                      {banner.description || "Banner - " + new Date(banner.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onLoadBanner(banner)}
                        title="Load Banner"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructiveOutline"
                        onClick={() => onDeleteBanner(banner.id)}
                        title="Delete Banner"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
