'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import RequireAuth from '@/components/RequireAuth';

const VideoEditor = dynamic(() => import('@/components/VideoEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500" />
    </div>
  ),
});

export default function Home() {
  const [showInstructions, setShowInstructions] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) setShowInstructions(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900 dark:from-slate-950 dark:to-slate-900 dark:text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800 dark:text-gray-100 md:text-4xl">Video Shorts Converter</h1>
          <p className="mx-auto mb-4 max-w-2xl text-gray-600 dark:text-gray-300">
            Trim a local video, choose the framing and platform preset, then preview the processed clip before downloading it.
          </p>
          <button onClick={() => setShowInstructions(true)} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
            <QuestionMarkCircleIcon className="mr-1 h-4 w-4" /> View Detailed Instructions
          </button>
        </div>

        <RequireAuth>
          <div className="rounded-lg bg-white p-6 shadow-lg dark:border dark:border-slate-700 dark:bg-slate-900">
            <VideoEditor />
          </div>
        </RequireAuth>

        {showInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
            <div ref={modalRef} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4">
                <h2 className="text-2xl font-bold text-gray-800">How to Create a Short Clip</h2>
                <button onClick={() => setShowInstructions(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close instructions">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-7 p-6 text-gray-700">
                <Instruction number="1" title="Upload a video">
                  Choose or drop an MP4, WebM, MOV, or OGG file from your device. The source video stays in your browser; it is not uploaded for trimming.
                </Instruction>
                <Instruction number="2" title="Choose the clip">
                  Scrub the timeline or use the playback controls, then set the start and end points. You can also drag the timeline handles or use I/O keyboard shortcuts.
                </Instruction>
                <Instruction number="3" title="Frame the output">
                  Pick a preset for Shorts, Reels, TikTok, square, portrait feed, or landscape. For cropped formats, drag the framing overlay or horizontal framing control to keep the important subject in view.
                </Instruction>
                <Instruction number="4" title="Choose export settings">
                  Select the source frame rate for accurate frame stepping and choose Standard, High, or Maximum export quality. Your non-sensitive export preferences are remembered locally.
                </Instruction>
                <Instruction number="5" title="Process, preview, and download">
                  Process the selected clip, review the generated video, and either download it or return to the editor to adjust timing or framing without uploading the source again.
                </Instruction>

                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-800">
                  Processing runs in your browser with FFmpeg WebAssembly. Longer or higher-quality clips can take more time and memory depending on the device.
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
                <button onClick={() => setShowInstructions(false)} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Got it</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 py-6 text-center text-sm text-gray-500">Video Shorts Editor — browser-based trimming and social-video export</footer>
    </div>
  );
}

function Instruction({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start">
      <div className="mr-4 mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">{number}</div>
      <div>
        <h3 className="mb-1 text-lg font-semibold text-gray-800">{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}
