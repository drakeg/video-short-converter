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
        <title>Video Shorts Editor</title>
        <meta name="description" content="Trim and edit your videos to create short clips" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Video Shorts Editor
        </h1>
        
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

        <div className="mt-12 max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to create a short video</h2>
          <ol className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">1</div>
              <p className="text-gray-700"><span className="font-medium">Upload</span> a video file by dragging and dropping or clicking to select</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">2</div>
              <p className="text-gray-700"><span className="font-medium">Play</span> the video and <span className="font-medium">set markers</span> for the start and end of your short clip</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">3</div>
              <p className="text-gray-700">Click <span className="font-medium">Download Short</span> to process your video</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">4</div>
              <p className="text-gray-700">Your new <span className="font-medium">short video</span> will automatically download in the perfect format for social media</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">4</div>
              <p className="text-gray-700"><span className="font-medium">Click play</span> again if you'd like to create additional shorts.</p>
            </li>
          </ol>
        </div>
      </main>

      <footer className="mt-16 py-6 text-center text-gray-500 text-sm">
        <p>Video Shorts Editor - Create perfect short videos for social media</p>
      </footer>
    </div>
  );
}
