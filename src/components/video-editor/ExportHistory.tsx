'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ClipQueueItem } from './clipQueue';
import { clearExportHistory, createExportHistoryManifestFile, EXPORT_HISTORY_CHANGED_EVENT, EXPORT_HISTORY_KEY, parseExportHistory, restoreClipQueueFromHistory, type ExportHistoryEntry } from './exportHistory';
import { parseProjectRecovery, PROJECT_RECOVERY_KEY, serializeProjectRecovery, type RecoverableProjectState } from './projectRecovery';

interface ExportHistoryProps {
  onRestoreQueue?: (clips: ClipQueueItem[]) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function readHistory(): ExportHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  return parseExportHistory(window.localStorage.getItem(EXPORT_HISTORY_KEY));
}

function downloadManifest(entry: ExportHistoryEntry): void {
  const file = createExportHistoryManifestFile(entry);
  if (!file) return;
  const url = URL.createObjectURL(file);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function restoreThroughRecovery(entry: ExportHistoryEntry): string | null {
  const clips = restoreClipQueueFromHistory(entry);
  if (!clips || clips.length === 0) return null;
  const existing = parseProjectRecovery(window.localStorage.getItem(PROJECT_RECOVERY_KEY));
  const source = entry.manifest?.source ?? existing?.source;
  if (!source) return null;
  const first = clips[0];
  const settings = first.settings;
  const next: RecoverableProjectState = {
    source: { ...source },
    savedAt: Date.now(),
    startTime: first.start,
    endTime: first.end,
    presetId: settings?.presetId ?? existing?.presetId ?? 'youtube-short',
    cropPosition: settings?.cropPosition ?? existing?.cropPosition ?? 50,
    cropPositionY: settings?.cropPositionY ?? existing?.cropPositionY ?? 50,
    quality: settings?.quality ?? existing?.quality ?? 'standard',
    frameRate: settings?.frameRate ?? existing?.frameRate ?? 30,
    muted: settings?.muted ?? existing?.muted ?? false,
    gainDb: settings?.gainDb ?? existing?.gainDb ?? 0,
    normalize: settings?.normalize ?? existing?.normalize ?? false,
    fadeIn: settings?.fadeIn ?? existing?.fadeIn ?? 0,
    fadeOut: settings?.fadeOut ?? existing?.fadeOut ?? 0,
    captionStyle: settings?.captionStyle ?? existing?.captionStyle ?? { size: 'medium', position: 'bottom', backdrop: true },
    burnCaptions: settings?.burnCaptions ?? existing?.burnCaptions ?? false,
    clipQueue: clips,
  };
  window.localStorage.setItem(PROJECT_RECOVERY_KEY, serializeProjectRecovery(next));
  return source.name;
}

export default function ExportHistory({ onRestoreQueue }: ExportHistoryProps) {
  const [entries, setEntries] = useState<ExportHistoryEntry[]>(readHistory);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
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

  const restore = (entry: ExportHistoryEntry) => {
    const clips = restoreClipQueueFromHistory(entry);
    if (!clips) return;
    if (onRestoreQueue) {
      onRestoreQueue(clips);
      setRestoreMessage(`Restored ${clips.length} clip${clips.length === 1 ? '' : 's'} to the current queue.`);
      return;
    }
    const sourceName = restoreThroughRecovery(entry);
    if (sourceName) setRestoreMessage(`Queue restored. Re-select ${sourceName} to load the exact source project.`);
    else setRestoreMessage('This older history entry has no source identity. Load its source video first, then restore the queue again.');
  };

  return <section className="rounded-lg border border-gray-200 bg-white p-4" aria-label="Recent export history">
    <div className="flex items-center justify-between gap-3">
      <div><h2 className="font-semibold text-gray-900">Recent exports</h2><p className="mt-1 text-xs text-gray-600">Stored only in this browser. Video files are never saved here.</p></div>
      <button type="button" onClick={clearExportHistory} className="rounded bg-gray-100 px-3 py-2 text-xs text-gray-700">Clear history</button>
    </div>
    {restoreMessage && <p className="mt-2 text-xs text-blue-700" role="status">{restoreMessage}</p>}
    <div className="mt-3 space-y-2">{entries.map((entry) => <article key={entry.id} className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2"><strong>{entry.successCount} of {entry.clipCount} clips exported</strong><span className="text-xs text-gray-500">{formatDate(entry.exportedAt)}</span></div>
      {entry.manifest?.source && <p className="mt-1 text-xs text-gray-600">Source: {entry.manifest.source.name}</p>}
      {entry.manifest && <p className="mt-1 text-xs text-gray-500">{onRestoreQueue ? 'Restore replaces the current clip queue with this saved export setup.' : entry.manifest.source ? `Restore prepares this queue; you will then re-select ${entry.manifest.source.name} to reopen the source video.` : 'Restore requires the original source video to be loaded before this older entry can be reused.'}</p>}
      {entry.successfulFiles.length > 0 && <p className="mt-1 text-xs text-gray-600">Files: {entry.successfulFiles.join(', ')}</p>}
      {entry.failureCount > 0 && <p className="mt-1 text-xs text-red-700">Failed: {entry.failedClips.map((failure) => failure.name).join(', ')}</p>}
      {entry.manifest && <div className="mt-2 flex flex-wrap gap-2"><button type="button" onClick={() => downloadManifest(entry)} className="rounded bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">Download metadata manifest</button><button type="button" onClick={() => restore(entry)} className="rounded bg-white px-3 py-1.5 text-xs font-medium text-green-700 shadow-sm">{onRestoreQueue ? 'Replace current queue' : entry.manifest.source ? 'Prepare queue to restore' : 'Try to restore queue'}</button></div>}
    </article>)}</div>
  </section>;
}
