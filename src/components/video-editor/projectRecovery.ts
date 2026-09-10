import type { CaptionStyle } from './CaptionOverlay';
import type { ClipExportSettings, ClipQueueItem } from './clipQueue';
import type { ExportQuality } from './editorConfig';

export const PROJECT_RECOVERY_KEY = 'video-short-converter:project-recovery:v1';

export interface SourceFingerprint {
  name: string;
  size: number;
  lastModified: number;
}

export interface RecoverableProjectState {
  source: SourceFingerprint;
  savedAt: number;
  startTime: number | null;
  endTime: number | null;
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
  clipQueue: ClipQueueItem[];
}

const finiteOrNull = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const clampPercent = (value: unknown, fallback = 50) => Math.min(100, Math.max(0, finiteOrNull(value) ?? fallback));
const parseQuality = (value: unknown): ExportQuality => ['standard', 'high', 'maximum'].includes(typeof value === 'string' ? value : '') ? value as ExportQuality : 'standard';
const parseCaptionStyle = (value: unknown): CaptionStyle => {
  const style = value && typeof value === 'object' ? value as Partial<CaptionStyle> : {};
  return {
    size: ['small', 'medium', 'large'].includes(style.size ?? '') ? style.size! : 'medium',
    position: ['top', 'middle', 'bottom'].includes(style.position ?? '') ? style.position! : 'bottom',
    backdrop: typeof style.backdrop === 'boolean' ? style.backdrop : true,
  } as CaptionStyle;
};

function parseClipSettings(value: unknown): ClipExportSettings | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const settings = value as Partial<ClipExportSettings>;
  return {
    presetId: typeof settings.presetId === 'string' && settings.presetId ? settings.presetId : 'youtube-short',
    cropPosition: clampPercent(settings.cropPosition),
    cropPositionY: clampPercent(settings.cropPositionY),
    quality: parseQuality(settings.quality),
    frameRate: typeof settings.frameRate === 'number' && [23.976, 24, 25, 29.97, 30, 50, 59.94, 60].includes(settings.frameRate) ? settings.frameRate : 30,
    muted: Boolean(settings.muted),
    gainDb: finiteOrNull(settings.gainDb) ?? 0,
    normalize: Boolean(settings.normalize),
    fadeIn: Math.max(0, finiteOrNull(settings.fadeIn) ?? 0),
    fadeOut: Math.max(0, finiteOrNull(settings.fadeOut) ?? 0),
    captionStyle: parseCaptionStyle(settings.captionStyle),
    burnCaptions: Boolean(settings.burnCaptions),
  };
}

export function buildSourceFingerprint(file: Pick<File, 'name' | 'size' | 'lastModified'>): SourceFingerprint {
  return { name: file.name, size: file.size, lastModified: file.lastModified };
}

export function sourceMatchesRecovery(file: Pick<File, 'name' | 'size' | 'lastModified'>, recovery: RecoverableProjectState): boolean {
  const source = buildSourceFingerprint(file);
  return source.name === recovery.source.name && source.size === recovery.source.size && source.lastModified === recovery.source.lastModified;
}

export function parseProjectRecovery(raw: string | null): RecoverableProjectState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<RecoverableProjectState>;
    if (!value.source || typeof value.source.name !== 'string' || !Number.isFinite(value.source.size) || !Number.isFinite(value.source.lastModified)) return null;
    const clipQueue = Array.isArray(value.clipQueue) ? value.clipQueue.flatMap((clip) => {
      if (!clip || typeof clip !== 'object') return [];
      const item = clip as Partial<ClipQueueItem>;
      if (typeof item.id !== 'string' || typeof item.name !== 'string' || !Number.isFinite(item.start) || !Number.isFinite(item.end) || item.end! <= item.start!) return [];
      const settings = parseClipSettings(item.settings);
      return [{ id: item.id, name: item.name, start: item.start!, end: item.end!, ...(settings ? { settings } : {}) }];
    }) : [];
    return {
      source: { name: value.source.name, size: value.source.size!, lastModified: value.source.lastModified! },
      savedAt: finiteOrNull(value.savedAt) ?? Date.now(),
      startTime: finiteOrNull(value.startTime),
      endTime: finiteOrNull(value.endTime),
      presetId: typeof value.presetId === 'string' && value.presetId ? value.presetId : 'youtube-short',
      cropPosition: clampPercent(value.cropPosition),
      cropPositionY: clampPercent(value.cropPositionY),
      quality: parseQuality(value.quality),
      frameRate: typeof value.frameRate === 'number' && [23.976, 24, 25, 29.97, 30, 50, 59.94, 60].includes(value.frameRate) ? value.frameRate : 30,
      muted: Boolean(value.muted),
      gainDb: finiteOrNull(value.gainDb) ?? 0,
      normalize: Boolean(value.normalize),
      fadeIn: Math.max(0, finiteOrNull(value.fadeIn) ?? 0),
      fadeOut: Math.max(0, finiteOrNull(value.fadeOut) ?? 0),
      captionStyle: parseCaptionStyle(value.captionStyle),
      burnCaptions: Boolean(value.burnCaptions),
      clipQueue,
    };
  } catch {
    return null;
  }
}

export function serializeProjectRecovery(state: RecoverableProjectState): string {
  return JSON.stringify(state);
}
