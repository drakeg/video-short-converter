'use client';

interface ProcessedVideoPreviewProps {
  url: string;
  fileName: string;
  onDownload: () => void;
  onEdit: () => void;
  onDiscard: () => void;
}

export default function ProcessedVideoPreview({ url, fileName, onDownload, onEdit, onDiscard }: ProcessedVideoPreviewProps) {
  return (
    <section className="space-y-4 rounded-lg border border-green-200 bg-green-50 p-4" aria-label="Processed video preview">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Preview your processed clip</h2>
        <p className="text-sm text-gray-600">Review the result before downloading. You can return to the editor without uploading the source again.</p>
      </div>
      <div className="mx-auto max-w-sm overflow-hidden rounded-lg bg-black">
        <video src={url} controls className="max-h-[70vh] w-full" aria-label="Processed video" />
      </div>
      <p className="truncate text-center text-xs text-gray-500">{fileName}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <button onClick={onEdit} className="rounded-lg bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300">Back to editor</button>
        <button onClick={onDiscard} className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium hover:bg-gray-50">Discard preview</button>
        <button onClick={onDownload} className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700">Download clip</button>
      </div>
    </section>
  );
}
