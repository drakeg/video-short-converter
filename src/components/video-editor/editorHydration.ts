import { parseExportPreferences, type ExportPreferences } from './exportPreferences';
import { parseProjectRecovery, type RecoverableProjectState } from './projectRecovery';

export interface EditorHydrationState {
  preferences: ExportPreferences;
  pendingRecovery: RecoverableProjectState | null;
}

export function hydrateEditorPersistence(
  rawPreferences: string | null,
  rawRecovery: string | null,
): EditorHydrationState {
  return {
    preferences: parseExportPreferences(rawPreferences),
    pendingRecovery: parseProjectRecovery(rawRecovery),
  };
}
