'use client';

import { useCallback, useEffect, useState } from 'react';
import { clearExportHistory, EXPORT_HISTORY_CHANGED_EVENT, EXPORT_HISTORY_KEY, parseExportHistory, type ExportHistoryEntry } from './exportHistory';

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function readHistory(): ExportHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  return parseExportHistory(window.localStorage.getItem(EXPORT_HISTORY_KEY));
}

export default function ExportHistory() {
  const [entries, setEntries] = useState<ExportHistoryEntry[]>(readHistory);
  const refresh = useCallback(() => setEntries(readHistory()), []);

  useEffect(() => {
    window.addEventListener(EXPORT_HISTORY_CHANGED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EXPORT_HISTORY_CHANGED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  if (entries.length === 0) return null;

  return <section className="rounded-lg border border-gray-200 bg-white p-4" aria-label="Recent export history">
    <div className="flex items-center justify-between gap-3">
      <div><h2 className="font-semibold text-gray-900">Recent exports</h2><p className="mt-1 text-xs text-gray-600">Stored only in this browser. Video files are never saved here.</p></div>
      <button type="button" onClick={clearExportHistory} className="rounded bg-gray-100 px-3 py-2 text-xs text-gray-700">Clear history</button>
    </div>
    <div className="mt-3 space-y-2">{entries.map((entry) => <article key={entry.id} className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2"><strong>{entry.successCount} of {entry.clipCount} clips exported</strong><span className="text-xs text-gray-500">{formatDate(entry.exportedAt)}</span></div>
      {entry.successfulFiles.length > 0 && <p className="mt-1 text-xs text-gray-600">Files: {entry.successfulFiles.join(', ')}</p>}
      {entry.failureCount > 0 && <p className="mt-1 text-xs text-red-700">Failed: {entry.failedClips.map((failure) => failure.name).join(', ')}</p>}
    </article>)}</div>
  </section>;
}
