
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Script from 'next/script'; // Import next/script
import './globals.css';
import { AppProvider } from '@/providers/app-provider';

export const metadata: Metadata = {
  title: 'BannerForge AI',
  description: 'Create captivating and personalized banners with the help of AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5738943819550045"
          crossOrigin="anonymous"
          strategy="afterInteractive" // Loads after the page is interactive
        />
      </head>
      <body className="antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
