import type { CaptionStyle } from './CaptionOverlay';
import type { ExportQuality } from './editorConfig';

export interface ClipExportSettings {
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

export interface ClipQueueItem {
  id: string;
  name: string;
  start: number;
  end: number;
  settings?: ClipExportSettings;
}

export function sanitizeClipName(value: string, fallback = 'clip'): string {
  const cleaned = value.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
  return cleaned || fallback;
}

export function createClipQueueItem(start: number, end: number, index: number, name?: string, settings?: ClipExportSettings): ClipQueueItem {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('Choose a valid start and end time before adding a clip.');
  const defaultName = `clip-${String(index + 1).padStart(2, '0')}`;
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: sanitizeClipName(name ?? defaultName, defaultName), start, end, settings };
}

export function buildClipFileName(sourceName: string, clipName: string): string {
  const source = sanitizeClipName(sourceName.replace(/\.[^/.]+$/, ''), 'video');
  return `${source}-${sanitizeClipName(clipName)}.mp4`;
}
