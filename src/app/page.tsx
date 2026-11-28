'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { QuestionMarkCircleIcon, XMarkIcon, FilmIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline';
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

  const helpTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!showInstructions) return;
    const dialog = modalRef.current;
    if (!dialog) return;
    // Restore focus to the control that opened the dialog when it closes.
    const priorFocus = document.activeElement instanceof HTMLElement ? document.activeElement : helpTriggerRef.current;
    const closeButton = dialog.querySelector<HTMLButtonElement>('[aria-label="Close instructions"]');
    closeButton?.focus();

    function handleDialogKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setShowInstructions(false);
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleDialogKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDialogKeyDown);
      priorFocus?.focus();
    };
  }, [showInstructions]);

  return (
    <div className="studio-shell min-h-screen text-slate-100">
      <main className="mx-auto max-w-[1680px] px-4 pb-12 pt-8 sm:px-6 lg:px-10 lg:pt-12">
        <header className="studio-hero mb-8 overflow-hidden rounded-[2rem] border p-6 sm:p-9 lg:p-12">
          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <span className="studio-monogram flex h-11 w-11 items-center justify-center rounded-2xl" aria-hidden="true"><FilmIcon className="h-6 w-6" /></span>
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-lime-300">Video Shorts Studio</span>
              </div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Your footage. Your next great clip.</p>
              <h1 className="studio-display max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">Make every moment <span className="text-lime-300">count.</span></h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Turn long recordings into polished, platform-ready shorts. Mark your best moments, frame the action and export — right in your browser.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2"><ShieldCheckIcon className="h-5 w-5 text-lime-300" /> Source video stays local</span>
                <span className="inline-flex items-center gap-2"><BoltIcon className="h-5 w-5 text-cyan-300" /> No cloud processing</span>
              </div>
            </div>
            <button ref={helpTriggerRef} type="button" onClick={() => setShowInstructions(true)} className="studio-help inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300">
              <QuestionMarkCircleIcon className="h-5 w-5" /> How it works
            </button>
          </div>
          <div aria-hidden="true" className="studio-hero-grid absolute inset-0" />
        </header>

        <RequireAuth>
          <div className="studio-editor-frame overflow-hidden rounded-[1.75rem] border p-3 sm:p-5 lg:p-7">
            <VideoEditor />
          </div>
        </RequireAuth>

        {showInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowInstructions(false); }}>
            <div ref={modalRef} className="studio-modal max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="studio-instructions-title">
              <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white p-4">
                <h2 id="studio-instructions-title" className="text-2xl font-bold text-gray-800">How to Create a Short Clip</h2>
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
                <button onClick={() => setShowInstructions(false)} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Got it</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="pb-8 pt-5 text-center text-sm text-slate-400">Video Shorts Editor — browser-based trimming and social-video export</footer>
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
