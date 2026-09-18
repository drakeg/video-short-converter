import type { CaptionStyle } from './CaptionOverlay';
import type { ClipExportSettings } from './clipQueue';
import type { ExportQuality } from './editorConfig';

export interface EditorExportSettingsSetters {
  setPresetId: (value: string) => void;
  setCropPosition: (value: number) => void;
  setCropPositionY: (value: number) => void;
  setQuality: (value: ExportQuality) => void;
  setFrameRate: (value: number) => void;
  setMuted: (value: boolean) => void;
  setGainDb: (value: number) => void;
  setNormalize: (value: boolean) => void;
  setFadeIn: (value: number) => void;
  setFadeOut: (value: number) => void;
  setCaptionStyle: (value: CaptionStyle) => void;
  setBurnCaptions: (value: boolean) => void;
}

export function applyEditorExportSettings(
  settings: ClipExportSettings,
  setters: EditorExportSettingsSetters,
): void {
  setters.setPresetId(settings.presetId);
  setters.setCropPosition(settings.cropPosition);
  setters.setCropPositionY(settings.cropPositionY);
  setters.setQuality(settings.quality);
  setters.setFrameRate(settings.frameRate);
  setters.setMuted(settings.muted);
  setters.setGainDb(settings.gainDb);
  setters.setNormalize(settings.normalize);
  setters.setFadeIn(settings.fadeIn);
  setters.setFadeOut(settings.fadeOut);
  setters.setCaptionStyle({ ...settings.captionStyle });
  setters.setBurnCaptions(settings.burnCaptions);
}
