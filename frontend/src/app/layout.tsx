import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

import { siteConfig } from "@/config/site.config";
import { APP_NAME } from "@/lib/constants";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? siteConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: siteConfig.description,
  keywords: [
    "travel",
    "travel agencies",
    "tours",
    "vacation packages",
    "trip planning",
  ],
  openGraph: {
    type: "website",
    locale: "en-US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  robots: {
    index: true,
    follow: true,
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
