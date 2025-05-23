
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/providers/app-provider";
import { Loader2, AlertTriangle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { handleSignIn, handleSignUp } = useApp();
  const [activeTab, setActiveTab] = useState("login"); // "login" or "register"

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let success = false;
    if (activeTab === "login") {
      const result = await handleSignIn(email, password);
      if (result) success = true;
    } else {
      const result = await handleSignUp(email, password);
      // For sign-up, we might not automatically log them in or
      // Firebase might do it. If successful, it closes modal via AppProvider.
      if (result) { 
        // AppProvider's handleSignUp already shows a toast.
        // It will close the modal on successful sign-in from onAuthStateChanged.
        // Resetting form here for UX if modal stays open due to flow.
        setEmail("");
        setPassword("");
      }
    }
    setIsLoading(false);
    // Modal is closed by AppProvider if auth is successful and onAuthStateChanged picks it up
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
      // Reset form state when modal is closed
      setEmail("");
      setPassword("");
      setError(null);
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {activeTab === "login" ? "Welcome Back!" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {activeTab === "login"
              ? "Log in to access your saved banners and content."
              : "Sign up to start creating and saving your work."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                  <AlertTriangle className="w-4 h-4 mr-2 shrink-0" />
                  {error}
                </div>
              )}
            </div>
            <DialogFooter className="mt-2">
               <DialogClose asChild>
                 <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  activeTab === "login" ? "Login" : "Register"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
