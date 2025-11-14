'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { XMarkIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

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
  const [showInstructions, setShowInstructions] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowInstructions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Request notification permission when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 dark:from-slate-950 dark:to-slate-900 dark:text-gray-100">

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 dark:text-gray-100">
            YouTube to Shorts Converter
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4 dark:text-gray-300">
            Trim any section of a YouTube video and convert it to portrait format for social media
          </p>
          <button
            onClick={() => setShowInstructions(true)}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />
            View Detailed Instructions
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 dark:bg-slate-900 dark:border dark:border-slate-700">
          <VideoEditor />
        </div>

        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl dark:bg-slate-900 dark:text-gray-100">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="text-gray-700">Processing video...</span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div 
              ref={modalRef}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">How to Create Short Videos</h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close instructions"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4 mt-0.5">1</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Upload Your Video</h3>
                      <div className="prose text-gray-700 space-y-2">
                        <p>• Click "Select Video" to upload a video file from your device</p>
                        <p>• Supported formats: MP4, WebM, MOV (up to 100MB)</p>
                        <p className="text-sm text-gray-500">Note: Ensure your video has good lighting and clear audio for best results</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4 mt-0.5">2</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Trim Your Clip</h3>
                      <div className="prose text-gray-700 space-y-2">
                        <p>• Play the video to find the perfect start point</p>
                        <p>• Click <strong>Set Start</strong> to mark the beginning of your short</p>
                        <p>• Click <strong>Set End</strong> to mark the end (max 60 seconds for most platforms)</p>
                        <p>• Use the timeline scrubber to fine-tune your selection</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4 mt-0.5">3</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Convert to Portrait</h3>
                      <div className="prose text-gray-700 space-y-2">
                        <p>• The video will automatically be converted to 9:16 aspect ratio (1080x1920)</p>
                        <p>• The system will detect and focus on the main content area</p>
                        <p>• For best results, ensure important content is centered in the frame</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mr-4 mt-0.5">4</div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-2">Download & Share</h3>
                      <div className="prose text-gray-700 space-y-2">
                        <p>• Click <strong>Download Short</strong> to process your video</p>
                        <p>• The processed video will automatically download in MP4 format</p>
                        <p>• For best results on social media:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          <li>YouTube Shorts: Upload directly from your device</li>
                          <li>Instagram Reels: Share from your camera roll</li>
                          <li>TikTok: Upload as a new video</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        <strong>Tip:</strong> For best results, keep your videos under 60 seconds and ensure good lighting and clear audio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Got it, let's start!
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 py-6 text-center text-gray-500 text-sm">
        <p>Video Shorts Editor - Create perfect short videos for social media</p>
      </footer>
    </div>
  );
}
