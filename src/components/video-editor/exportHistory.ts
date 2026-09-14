import type { BatchExportFailure } from './batchExport';
import type { ClipExportSettings, ClipQueueItem } from './clipQueue';
import { parseProjectRecovery, PROJECT_RECOVERY_KEY, type SourceFingerprint } from './projectRecovery';

export const EXPORT_HISTORY_KEY = 'video-short-converter:export-history';
export const EXPORT_HISTORY_CHANGED_EVENT = 'video-short-converter:export-history-changed';
const MAX_HISTORY_ENTRIES = 10;

export interface ExportHistoryManifestClip {
  id: string;
  name: string;
  start: number;
  end: number;
  duration: number;
  status: 'exported' | 'failed';
  outputFile?: string;
  error?: string;
  settingsCaptured: boolean;
  settings?: ClipExportSettings;
}

export interface ExportHistoryManifest {
  schemaVersion: 1 | 2;
  exportedAt: string;
  source?: SourceFingerprint;
  clips: ExportHistoryManifestClip[];
}

export interface ExportHistoryEntry {
  id: string;
  exportedAt: string;
  clipCount: number;
  successCount: number;
  failureCount: number;
  successfulFiles: string[];
  failedClips: Array<{ name: string; message: string }>;
  manifest?: ExportHistoryManifest;
}

function isSourceFingerprint(value: unknown): value is SourceFingerprint {
  if (!value || typeof value !== 'object') return false;
  const source = value as Partial<SourceFingerprint>;
  return typeof source.name === 'string'
    && Number.isFinite(source.size)
    && Number.isFinite(source.lastModified);
}

function isHistoryManifest(value: unknown): value is ExportHistoryManifest {
  if (!value || typeof value !== 'object') return false;
  const manifest = value as Partial<ExportHistoryManifest>;
  const validSchema = manifest.schemaVersion === 1 || manifest.schemaVersion === 2;
  const validSource = manifest.schemaVersion === 1 ? manifest.source === undefined || isSourceFingerprint(manifest.source) : isSourceFingerprint(manifest.source);
  return validSchema
    && validSource
    && typeof manifest.exportedAt === 'string'
    && Array.isArray(manifest.clips)
    && manifest.clips.every((clip) => Boolean(clip)
      && typeof clip.id === 'string'
      && typeof clip.name === 'string'
      && Number.isFinite(clip.start)
      && Number.isFinite(clip.end)
      && clip.end > clip.start
      && Number.isFinite(clip.duration)
      && (clip.status === 'exported' || clip.status === 'failed')
      && typeof clip.settingsCaptured === 'boolean');
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
        && entry.failedClips.every((failure: unknown) => Boolean(failure) && typeof (failure as { name?: unknown }).name === 'string' && typeof (failure as { message?: unknown }).message === 'string')
        && (entry.manifest === undefined || isHistoryManifest(entry.manifest));
    }).slice(0, MAX_HISTORY_ENTRIES);
  } catch {
    return [];
  }
}

function buildHistoryManifest(clips: ClipQueueItem[], files: File[], failures: BatchExportFailure[], exportedAt: string, source?: SourceFingerprint): ExportHistoryManifest {
  const failedById = new Map(failures.map((failure) => [failure.clip.id, failure]));
  let fileIndex = 0;
  return {
    schemaVersion: source ? 2 : 1,
    exportedAt,
    ...(source ? { source: { ...source } } : {}),
    clips: clips.map((clip) => {
      const failure = failedById.get(clip.id);
      const common = {
        id: clip.id,
        name: clip.name,
        start: clip.start,
        end: clip.end,
        duration: clip.end - clip.start,
        settingsCaptured: Boolean(clip.settings),
        ...(clip.settings ? { settings: { ...clip.settings, captionStyle: { ...clip.settings.captionStyle } } } : {}),
      };
      if (failure) return { ...common, status: 'failed' as const, error: failure.message };
      const file = files[fileIndex++];
      return { ...common, status: 'exported' as const, outputFile: file?.name };
    }),
  };
}

export function buildExportHistoryEntry(clips: ClipQueueItem[], files: File[], failures: BatchExportFailure[], exportedAt = new Date(), source?: SourceFingerprint): ExportHistoryEntry {
  const timestamp = exportedAt.toISOString();
  return {
    id: `${timestamp}:${clips.map((clip) => clip.id).join(',')}`,
    exportedAt: timestamp,
    clipCount: clips.length,
    successCount: files.length,
    failureCount: failures.length,
    successfulFiles: files.map((file) => file.name),
    failedClips: failures.map(({ clip, message }) => ({ name: clip.name, message })),
    manifest: buildHistoryManifest(clips, files, failures, timestamp, source),
  };
}

export function appendExportHistory(entries: ExportHistoryEntry[], entry: ExportHistoryEntry): ExportHistoryEntry[] {
  return [entry, ...entries.filter((existing) => existing.id !== entry.id)].slice(0, MAX_HISTORY_ENTRIES);
}

export function recordExportHistory(clips: ClipQueueItem[], files: File[], failures: BatchExportFailure[]): void {
  if (typeof window === 'undefined') return;
  const recovery = parseProjectRecovery(window.localStorage.getItem(PROJECT_RECOVERY_KEY));
  const entry = buildExportHistoryEntry(clips, files, failures, new Date(), recovery?.source);
  const next = appendExportHistory(parseExportHistory(window.localStorage.getItem(EXPORT_HISTORY_KEY)), entry);
  window.localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EXPORT_HISTORY_CHANGED_EVENT));
}

export function createExportHistoryManifestFile(entry: ExportHistoryEntry): File | null {
  if (!entry.manifest) return null;
  return new File([`${JSON.stringify(entry.manifest, null, 2)}\n`], 'export-history-manifest.json', { type: 'application/json' });
}

export function restoreClipQueueFromHistory(entry: ExportHistoryEntry): ClipQueueItem[] | null {
  if (!entry.manifest) return null;
  return entry.manifest.clips.map((clip, index) => ({
    id: `restored-${entry.exportedAt}-${index}-${clip.id}`,
    name: clip.name,
    start: clip.start,
    end: clip.end,
    ...(clip.settingsCaptured && clip.settings ? { settings: { ...clip.settings, captionStyle: { ...clip.settings.captionStyle } } } : {}),
  }));
}

export function clearExportHistory(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(EXPORT_HISTORY_KEY);
  window.dispatchEvent(new Event(EXPORT_HISTORY_CHANGED_EVENT));
}
