import type { ClipQueueItem } from './clipQueue';
import type { ClipExportSettings } from './clipQueue';
import {
  EXPORT_PREFERENCES_KEY,
  serializeExportPreferences,
  type ExportPreferences,
} from './exportPreferences';
import { hydrateEditorPersistence, type EditorHydrationState } from './editorHydration';
import {
  buildRecoverableProjectState,
  buildSourceFingerprint,
  PROJECT_RECOVERY_KEY,
  serializeProjectRecovery,
} from './projectRecovery';

export interface EditorStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function readEditorPersistence(storage: Pick<EditorStorage, 'getItem'>): EditorHydrationState {
  return hydrateEditorPersistence(
    storage.getItem(EXPORT_PREFERENCES_KEY),
    storage.getItem(PROJECT_RECOVERY_KEY),
  );
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
