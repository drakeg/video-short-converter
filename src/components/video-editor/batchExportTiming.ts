import type { ClipQueueItem } from './clipQueue';
import { calculateLocalExportTiming, type LocalExportTiming } from './localExportTiming';

export interface BatchExportTiming extends LocalExportTiming {
  successfulClips: number;
  attemptedClips: number;
  failedClips: number;
}

/** Overall batch wall time includes ZIP packaging; clipSeconds counts only successful clips. */
export function calculateBatchExportTiming(
  startedMs: number,
  finishedMs: number,
  attemptedClips: readonly ClipQueueItem[],
  failedClipIds: readonly string[],
): BatchExportTiming | null {
  if (!attemptedClips.length || failedClipIds.length > attemptedClips.length) return null;
  const failures = new Set(failedClipIds);
  const successful = attemptedClips.filter((clip) => !failures.has(clip.id));
  if (failures.size !== failedClipIds.length || attemptedClips.some((clip) => !Number.isFinite(clip.start) || !Number.isFinite(clip.end) || clip.end <= clip.start)) return null;
  const clipSeconds = successful.reduce((seconds, clip) => seconds + clip.end - clip.start, 0);
  const base = calculateLocalExportTiming(startedMs, finishedMs, clipSeconds);
  if (!base) return null;
  return {
    ...base,
    successfulClips: successful.length,
    attemptedClips: attemptedClips.length,
    failedClips: failures.size,
  };
}
