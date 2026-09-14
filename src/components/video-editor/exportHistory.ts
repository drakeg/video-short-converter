import type { BatchExportFailure } from './batchExport';
import type { ClipQueueItem } from './clipQueue';

export const EXPORT_HISTORY_KEY = 'video-short-converter:export-history';
export const EXPORT_HISTORY_CHANGED_EVENT = 'video-short-converter:export-history-changed';
const MAX_HISTORY_ENTRIES = 10;

export interface ExportHistoryEntry {
  id: string;
  exportedAt: string;
  clipCount: number;
  successCount: number;
  failureCount: number;
  successfulFiles: string[];
  failedClips: Array<{ name: string; message: string }>;
}

export function parseExportHistory(raw: string | null): ExportHistoryEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is ExportHistoryEntry => {
      return Boolean(entry)
        && typeof entry.id === 'string'
        && typeof entry.exportedAt === 'string'
        && Number.isInteger(entry.clipCount)
        && Number.isInteger(entry.successCount)
        && Number.isInteger(entry.failureCount)
        && Array.isArray(entry.successfulFiles)
        && entry.successfulFiles.every((name: unknown) => typeof name === 'string')
        && Array.isArray(entry.failedClips)
        && entry.failedClips.every((failure: unknown) => Boolean(failure) && typeof (failure as { name?: unknown }).name === 'string' && typeof (failure as { message?: unknown }).message === 'string');
    }).slice(0, MAX_HISTORY_ENTRIES);
  } catch {
    return [];
  }
}

export function buildExportHistoryEntry(clips: ClipQueueItem[], files: File[], failures: BatchExportFailure[], exportedAt = new Date()): ExportHistoryEntry {
  const timestamp = exportedAt.toISOString();
  return {
    id: `${timestamp}:${clips.map((clip) => clip.id).join(',')}`,
    exportedAt: timestamp,
    clipCount: clips.length,
    successCount: files.length,
    failureCount: failures.length,
    successfulFiles: files.map((file) => file.name),
    failedClips: failures.map(({ clip, message }) => ({ name: clip.name, message })),
  };
}

export function appendExportHistory(entries: ExportHistoryEntry[], entry: ExportHistoryEntry): ExportHistoryEntry[] {
  return [entry, ...entries.filter((existing) => existing.id !== entry.id)].slice(0, MAX_HISTORY_ENTRIES);
}

export function recordExportHistory(clips: ClipQueueItem[], files: File[], failures: BatchExportFailure[]): void {
  if (typeof window === 'undefined') return;
  const next = appendExportHistory(parseExportHistory(window.localStorage.getItem(EXPORT_HISTORY_KEY)), buildExportHistoryEntry(clips, files, failures));
  window.localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EXPORT_HISTORY_CHANGED_EVENT));
}

export function clearExportHistory(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(EXPORT_HISTORY_KEY);
  window.dispatchEvent(new Event(EXPORT_HISTORY_CHANGED_EVENT));
}
