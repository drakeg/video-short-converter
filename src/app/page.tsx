'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import the VideoEditor component with SSR disabled
const VideoEditor = dynamic(
  () => import('@/components/VideoEditor'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Request notification permission when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Head>
        <title>YouTube to Shorts Converter | Trim & Resize Videos</title>
        <meta name="description" content="Easily trim any section of a YouTube video and convert it to portrait format for Shorts, Reels, and TikTok" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
          YouTube to Shorts Converter
        </h1>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Trim any section of a YouTube video and convert it to portrait format for social media
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <VideoEditor />
        </div>

        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="text-gray-700">Processing video...</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">How to Create a Short Video</h2>
          <div className="space-y-6">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4 mt-0.5">1</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Paste YouTube URL or Upload</h3>
                <p className="text-gray-700">Enter a YouTube URL or upload your own video file</p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4 mt-0.5">2</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Trim Your Clip</h3>
                <p className="text-gray-700">Play the video and set start/end points for your short</p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4 mt-0.5">3</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Convert to Portrait</h3>
                <p className="text-gray-700">Automatically resize to 9:16 portrait format</p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4 mt-0.5">4</div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Download & Share</h3>
                <p className="text-gray-700">Get your optimized video ready for YouTube Shorts, Reels, or TikTok</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 py-6 text-center text-gray-500 text-sm">
        <p>Video Shorts Editor - Create perfect short videos for social media</p>
      </footer>
    </div>
  );
}
