import type { ClipQueueItem } from './clipQueue';
import { sourceMatchesRecovery, type RecoverableProjectState } from './projectRecovery';
import { validateVideoFile } from './runtimeSupport';

export type SourceSelectionResolution =
  | { ok: false; error: string }
  | {
      ok: true;
      recovery: RecoverableProjectState | null;
      startTime: number | null;
      endTime: number | null;
      trimDuration: number;
      clipQueue: ClipQueueItem[];
      warning: string | null;
    };

export function resolveSourceSelection(
  file: File,
  pendingRecovery: RecoverableProjectState | null,
): SourceSelectionResolution {
  const validation = validateVideoFile(file);
  if (validation.error) return { ok: false, error: validation.error };

  const recovery = pendingRecovery && sourceMatchesRecovery(file, pendingRecovery)
    ? pendingRecovery
    : null;

  if (!recovery) {
    return {
      ok: true,
      recovery: null,
      startTime: null,
      endTime: null,
      trimDuration: 0,
      clipQueue: [],
      warning: validation.warning ?? null,
    };
  }

  return {
    ok: true,
    recovery,
    startTime: recovery.startTime,
    endTime: recovery.endTime,
    trimDuration: Math.max(0, (recovery.endTime ?? 0) - (recovery.startTime ?? 0)),
    clipQueue: recovery.clipQueue,
    warning: `Recovered your saved edit for ${file.name}.`,
  };
}
