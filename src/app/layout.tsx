import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeToggle from "./ThemeToggle";
import AuthNav from "@/components/AuthNav";

export const metadata: Metadata = {
  title: "Video Shorts Studio | Local Video Editor",
  description: "Turn your own local recordings into short-form videos. Trim, reframe, caption, preview and export directly in your browser.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0b111c',
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
        <meta name="theme-color" content="#0b111c" />
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
