
"use client";

import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateUserSocialLinks, getUserSocialLinks } from "@/lib/firebase-service";
import type { SocialLinks } from "@/lib/types";
import { Link, Loader2, Save } from "lucide-react";

interface SocialLinksEditorProps {
  userId: string;
}

export function SocialLinksEditor({ userId }: SocialLinksEditorProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    twitter: '',
    linkedin: '',
    github: '',
    website: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLinks = async () => {
      if (!userId) {
        setIsFetching(false);
        return;
      }
      setIsFetching(true);
      try {
        const links = await getUserSocialLinks(userId);
        if (links) {
          setSocialLinks(currentLinks => ({
            twitter: links.twitter || '',
            linkedin: links.linkedin || '',
            github: links.github || '',
            website: links.website || '',
          }));
        }
      } catch (error) {
        console.error("Error fetching social links:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch your social links.",
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchLinks();
  }, [userId, toast]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to save social links.",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Filter out empty strings to avoid saving them as empty fields if not intended
      const linksToSave = Object.fromEntries(
        Object.entries(socialLinks).filter(([, value]) => value && value.trim() !== '')
      );
      await updateUserSocialLinks(userId, linksToSave);
      toast({
        title: "Success",
        description: "Social links updated successfully!",
      });
    } catch (error) {
      console.error("Error updating social links:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to update social links.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="mr-2 h-5 w-5 text-primary" />
            Your Social Links
          </CardTitle>
          <CardDescription>Manage your social media profiles and personal website.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Link className="mr-2 h-5 w-5 text-primary" />
          Your Social Links
        </CardTitle>
        <CardDescription>Manage your social media profiles and personal website. These may be displayed publicly.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="twitter">Twitter Profile URL</Label>
            <Input
              id="twitter"
              name="twitter"
              type="url"
              value={socialLinks.twitter}
              onChange={handleInputChange}
              placeholder="https://twitter.com/yourusername"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
            <Input
              id="linkedin"
              name="linkedin"
              type="url"
              value={socialLinks.linkedin}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourusername"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="github">GitHub Profile URL</Label>
            <Input
              id="github"
              name="github"
              type="url"
              value={socialLinks.github}
              onChange={handleInputChange}
              placeholder="https://github.com/yourusername"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="website">Personal Website URL</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={socialLinks.website}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={isLoading || !userId} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Social Links
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
