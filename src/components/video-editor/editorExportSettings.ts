import type { CaptionStyle } from './CaptionOverlay';
import type { ClipExportSettings } from './clipQueue';
import type { ExportQuality } from './editorConfig';

export interface EditorExportSettingsInput {
  presetId: string;
  cropPosition: number;
  cropPositionY: number;
  quality: ExportQuality;
  frameRate: number;
  muted: boolean;
  gainDb: number;
  normalize: boolean;
  fadeIn: number;
  fadeOut: number;
  captionStyle: CaptionStyle;
  burnCaptions: boolean;
}

export function buildEditorExportSettings(input: EditorExportSettingsInput): ClipExportSettings {
  return {
    presetId: input.presetId,
    cropPosition: input.cropPosition,
    cropPositionY: input.cropPositionY,
    quality: input.quality,
    frameRate: input.frameRate,
    muted: input.muted,
    gainDb: input.gainDb,
    normalize: input.normalize,
    fadeIn: input.fadeIn,
    fadeOut: input.fadeOut,
    captionStyle: { ...input.captionStyle },
    burnCaptions: input.burnCaptions,
  };
}
