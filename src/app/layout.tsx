import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeToggle from "./ThemeToggle";
import AuthNav from "@/components/AuthNav";

export const metadata: Metadata = {
  title: "YouTube to Shorts Converter | Trim & Resize Videos",
  description: "Easily trim any section of a YouTube video and convert it to portrait format for Shorts, Reels, and TikTok",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#ffffff',
  userScalable: false
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="font-sans">
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <AuthNav />
        {children}
      </body>
    </html>
  );
}
