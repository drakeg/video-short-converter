'use client';

import { useState, type DragEvent } from 'react';
import { ArrowUpTrayIcon, FilmIcon } from '@heroicons/react/24/outline';

interface VideoUploaderProps {
  onFileSelected: (file: File) => void;
}

export default function VideoUploader({ onFileSelected }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <label
      className={`studio-upload group block cursor-pointer rounded-3xl border-2 border-dashed px-5 py-12 text-center transition-all sm:px-12 sm:py-16 ${isDragging ? 'studio-upload-active' : ''}`}
      onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="sr-only"
        accept="video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
          event.currentTarget.value = '';
        }}
      />
      <span aria-hidden="true" className="studio-upload-icon mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem]"><FilmIcon className="h-10 w-10" /></span>
      <span className="block text-2xl font-semibold tracking-tight text-white sm:text-3xl">Drop your next big moment here.</span>
      <span className="mx-auto mt-3 block max-w-xl text-sm leading-6 text-slate-300">Drag a recording into the studio, or browse to choose a file from your device.</span>
      <span className="studio-upload-action mx-auto mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"><ArrowUpTrayIcon className="h-5 w-5" /> Choose video</span>
      <span className="mt-5 block text-xs font-medium uppercase tracking-wider text-slate-400">MP4 · WebM · MOV · OGG</span>
      <span className="mt-2 block text-xs text-slate-400">Your source video stays on this device.</span>
    </label>
  );
}
