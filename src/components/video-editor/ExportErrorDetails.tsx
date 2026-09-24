'use client';

import { useState } from 'react';
import { copyTextToClipboard } from './browserClipboard';

export function isExportFailureMessage(message: string): boolean {
  return /^(Video processing failed|Batch export failed|Unable to (?:load .*video processor|initialize the video processor)|The video processor|Burned-in captions)/i.test(message);
}

export default function ExportErrorDetails({ message }: { message: string }) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const copyDetails = async () => {
    const copied = await copyTextToClipboard(message);
    setCopyStatus(copied ? 'Copied export details.' : 'Copy failed. Select the details below and copy them manually.');
  };

  return (
    <div className="mb-4 rounded border border-red-400 bg-red-50 p-4 text-red-800" role="alert">
      <div className="font-semibold">Export failed</div>
      <p className="mt-1 text-sm">The video processor reported the following details:</p>
      <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded bg-white/70 p-3 text-xs" data-testid="export-error-details">{message}</pre>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={copyDetails} className="rounded bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm ring-1 ring-red-200">
          Copy details
        </button>
        {copyStatus&&<span className="text-xs" role="status">{copyStatus}</span>}
      </div>
    </div>
  );
}
