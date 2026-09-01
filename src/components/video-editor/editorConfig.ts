export type CropMode = 'crop' | 'fit';

export interface ExportPreset {
  id: string;
  label: string;
  platform: string;
  width: number;
  height: number;
  cropMode: CropMode;
}

export interface VideoExportOptions {
  presetId: string;
  cropPosition: number;
}

export const EXPORT_PRESETS: ExportPreset[] = [
  { id: 'youtube-short', label: 'YouTube Short (9:16)', platform: 'YouTube Shorts', width: 1080, height: 1920, cropMode: 'crop' },
  { id: 'instagram-reel', label: 'Instagram Reel (9:16)', platform: 'Instagram Reels', width: 1080, height: 1920, cropMode: 'crop' },
  { id: 'tiktok', label: 'TikTok (9:16)', platform: 'TikTok', width: 1080, height: 1920, cropMode: 'crop' },
  { id: 'instagram-feed', label: 'Instagram Feed (4:5)', platform: 'Instagram', width: 1080, height: 1350, cropMode: 'crop' },
  { id: 'square', label: 'Square (1:1)', platform: 'Universal', width: 1080, height: 1080, cropMode: 'crop' },
  { id: 'landscape', label: 'Landscape (16:9)', platform: 'Universal', width: 1920, height: 1080, cropMode: 'fit' },
];

export const FRAME_RATE_OPTIONS = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60] as const;

export const DEFAULT_PRESET = EXPORT_PRESETS[0];

export function getExportPreset(presetId: string): ExportPreset {
  return EXPORT_PRESETS.find((preset) => preset.id === presetId) ?? DEFAULT_PRESET;
}

export function clampCropPosition(position: number): number {
  return Math.min(100, Math.max(0, position));
}

export function buildVideoFilter(options: VideoExportOptions): string {
  const preset = getExportPreset(options.presetId);

  if (preset.cropMode === 'fit') {
    return `scale=${preset.width}:${preset.height}:force_original_aspect_ratio=decrease,pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2`;
  }

  const ratio = Number((preset.width / preset.height).toFixed(6));
  const horizontalPosition = Number((clampCropPosition(options.cropPosition) / 100).toFixed(4));

  return [
    `crop='if(gt(iw/ih,${ratio}),ih*${ratio},iw)'`,
    `'if(gt(iw/ih,${ratio}),ih,iw/${ratio})'`,
    `'if(gt(iw/ih,${ratio}),(iw-ow)*${horizontalPosition},0)'`,
    `'if(gt(iw/ih,${ratio}),0,(ih-oh)/2)'`,
    `scale=${preset.width}:${preset.height}`,
  ].join(':').replace(':scale=', ',scale=');
}
