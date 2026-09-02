'use client';

import { useState, type DragEvent } from 'react';

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
      className={`block cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="hidden"
        accept="video/mp4,video/webm,video/quicktime,video/ogg,.mp4,.webm,.mov,.ogg"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
          event.currentTarget.value = '';
        }}
      />
      <span className="block text-gray-600">Click or drop a video file here</span>
      <span className="mt-2 block text-sm text-gray-400">Supported formats: MP4, WebM, MOV, OGG</span>
    </label>
  );
}
