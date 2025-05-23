
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
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
      <body className="antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
