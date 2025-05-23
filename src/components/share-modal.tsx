
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, X } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export function ShareModal({ isOpen, onClose, shareUrl }: ShareModalProps) {
  const { toast } = useToast();

  const copySharedUrlToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({ title: "Success", description: "Share link copied to clipboard!" });
    }).catch(err => {
      toast({ variant: "destructive", title: "Error", description: "Failed to copy link." });
    });
  };

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">Content Shared!</AlertDialogTitle>
          <AlertDialogDescription>
            Copy the link below to share your AI-generated content:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 my-4">
          <Input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1"
          />
          <Button
            onClick={copySharedUrlToClipboard}
            variant="outline"
            size="icon"
            title="Copy link"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Note: For others to view, Firestore security rules for shared content paths must allow public read access.
        </p>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} asChild>
            <Button variant="ghost">Close</Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
