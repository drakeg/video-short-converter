import type { ExportQuality } from './editorConfig';
import type { EditorHydrationState } from './editorHydration';

export interface EditorStartupState {
  presetId?: string;
  cropPosition?: number;
  cropPositionY?: number;
  quality?: ExportQuality;
  pendingRecovery: EditorHydrationState['pendingRecovery'];
}

export function resolveEditorStartupState(hydrated: EditorHydrationState): EditorStartupState {
  const { preferences, pendingRecovery } = hydrated;
  return {
    ...(preferences.presetId ? { presetId: preferences.presetId } : {}),
    ...(preferences.cropPosition !== undefined ? { cropPosition: preferences.cropPosition } : {}),
    ...(preferences.cropPositionY !== undefined ? { cropPositionY: preferences.cropPositionY } : {}),
    ...(preferences.quality ? { quality: preferences.quality } : {}),
    pendingRecovery,
  };
}
