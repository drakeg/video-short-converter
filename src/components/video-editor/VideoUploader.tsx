'use client';

interface VideoUploaderProps {
  onFileSelected: (file: File) => void;
}

export default function VideoUploader({ onFileSelected }: VideoUploaderProps) {
  return (
    <label className="block border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors">
      <input
        type="file"
        className="hidden"
        accept="video/mp4,video/webm,video/quicktime,video/ogg"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
      <span className="block text-gray-600">Click or drop a video file here</span>
      <span className="block text-sm text-gray-400 mt-2">Supported formats: MP4, WebM, MOV, OGG</span>
    </label>
  );
}
