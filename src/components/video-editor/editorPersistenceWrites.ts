import type { ClipQueueItem } from './clipQueue';
import type { ClipExportSettings } from './clipQueue';
import {
  EXPORT_PREFERENCES_KEY,
  serializeExportPreferences,
  type ExportPreferences,
} from './exportPreferences';
import {
  buildRecoverableProjectState,
  buildSourceFingerprint,
  PROJECT_RECOVERY_KEY,
  serializeProjectRecovery,
} from './projectRecovery';

export interface EditorStorage {
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function persistExportPreferences(
  storage: EditorStorage,
  preferences: Required<ExportPreferences>,
): void {
  storage.setItem(EXPORT_PREFERENCES_KEY, serializeExportPreferences(preferences));
}

export function persistEditorRecovery(
  storage: EditorStorage,
  sourceFile: File,
  startTime: number | null,
  endTime: number | null,
  settings: ClipExportSettings,
  clipQueue: ClipQueueItem[],
): void {
  const state = buildRecoverableProjectState({
    source: buildSourceFingerprint(sourceFile),
    startTime,
    endTime,
    settings,
    clipQueue,
  });
  storage.setItem(PROJECT_RECOVERY_KEY, serializeProjectRecovery(state));
}

export function clearEditorRecovery(storage: EditorStorage): void {
  storage.removeItem(PROJECT_RECOVERY_KEY);
}
