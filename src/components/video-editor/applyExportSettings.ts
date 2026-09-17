import type { Dispatch, SetStateAction } from 'react';
import type { CaptionStyle } from './CaptionOverlay';
import type { ClipExportSettings } from './clipQueue';
import type { ExportQuality } from './editorConfig';

export interface ExportSettingsSetters {
  setPresetId: Dispatch<SetStateAction<string>>;
  setCropPosition: Dispatch<SetStateAction<number>>;
  setCropPositionY: Dispatch<SetStateAction<number>>;
  setQuality: Dispatch<SetStateAction<ExportQuality>>;
  setFrameRate: Dispatch<SetStateAction<number>>;
  setMuted: Dispatch<SetStateAction<boolean>>;
  setGainDb: Dispatch<SetStateAction<number>>;
  setNormalize: Dispatch<SetStateAction<boolean>>;
  setFadeIn: Dispatch<SetStateAction<number>>;
  setFadeOut: Dispatch<SetStateAction<number>>;
  setCaptionStyle: Dispatch<SetStateAction<CaptionStyle>>;
  setBurnCaptions: Dispatch<SetStateAction<boolean>>;
}

export function applyExportSettings(settings: ClipExportSettings, setters: ExportSettingsSetters): void {
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
