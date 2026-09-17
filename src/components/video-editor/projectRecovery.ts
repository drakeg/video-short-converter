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

export interface BuildRecoverableProjectStateInput {
  source: SourceFingerprint;
  savedAt?: number;
  startTime: number | null;
  endTime: number | null;
  settings: ClipExportSettings;
  clipQueue: ClipQueueItem[];
}

const finiteOrNull = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const nonNegativeOrNull = (value: unknown): number | null => {
  const parsed = finiteOrNull(value);
  return parsed === null ? null : Math.max(0, parsed);
};
const parseSourceFingerprint = (value: unknown): SourceFingerprint | null => {
  if (!value || typeof value !== 'object') return null;
  const source = value as Partial<SourceFingerprint>;
  if (typeof source.name !== 'string' || source.name.trim().length === 0) return null;
  if (!Number.isSafeInteger(source.size) || source.size! < 0) return null;
  if (!Number.isSafeInteger(source.lastModified) || source.lastModified! < 0) return null;
  return { name: source.name, size: source.size!, lastModified: source.lastModified! };
};
const parseTrimRange = (startValue: unknown, endValue: unknown): Pick<RecoverableProjectState, 'startTime' | 'endTime'> => {
  const startTime = nonNegativeOrNull(startValue);
  const endTime = nonNegativeOrNull(endValue);
  if (startTime !== null && endTime !== null && endTime <= startTime) return { startTime: null, endTime: null };
  return { startTime, endTime };
};
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

export function buildRecoverableProjectState(input: BuildRecoverableProjectStateInput): RecoverableProjectState {
  return {
    source: { ...input.source },
    savedAt: input.savedAt ?? Date.now(),
    startTime: input.startTime,
    endTime: input.endTime,
    ...input.settings,
    captionStyle: { ...input.settings.captionStyle },
    clipQueue: input.clipQueue,
  };
}

export function recoveryExportSettings(recovery: RecoverableProjectState): ClipExportSettings {
  return {
    presetId: recovery.presetId,
    cropPosition: recovery.cropPosition,
    cropPositionY: recovery.cropPositionY,
    quality: recovery.quality,
    frameRate: recovery.frameRate,
    muted: recovery.muted,
    gainDb: recovery.gainDb,
    normalize: recovery.normalize,
    fadeIn: recovery.fadeIn,
    fadeOut: recovery.fadeOut,
    captionStyle: { ...recovery.captionStyle },
    burnCaptions: recovery.burnCaptions,
  };
}

export function sourceMatchesRecovery(file: Pick<File, 'name' | 'size' | 'lastModified'>, recovery: RecoverableProjectState): boolean {
  const source = buildSourceFingerprint(file);
  return source.name === recovery.source.name && source.size === recovery.source.size && source.lastModified === recovery.source.lastModified;
}

export function parseProjectRecovery(raw: string | null): RecoverableProjectState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<RecoverableProjectState>;
    const source = parseSourceFingerprint(value.source);
    if (!source) return null;
    const settings = parseClipSettings(value);
    if (!settings) return null;
    const trimRange = parseTrimRange(value.startTime, value.endTime);
    const clipQueue = Array.isArray(value.clipQueue) ? value.clipQueue.flatMap((clip) => {
      if (!clip || typeof clip !== 'object') return [];
      const item = clip as Partial<ClipQueueItem>;
      if (typeof item.id !== 'string' || typeof item.name !== 'string' || !Number.isFinite(item.start) || !Number.isFinite(item.end) || item.start! < 0 || item.end! <= item.start!) return [];
      const clipSettings = parseClipSettings(item.settings);
      return [{ id: item.id, name: item.name, start: item.start!, end: item.end!, ...(clipSettings ? { settings: clipSettings } : {}) }];
    }) : [];
    return {
      source,
      savedAt: finiteOrNull(value.savedAt) ?? Date.now(),
      ...trimRange,
      ...settings,
      clipQueue,
    };
  } catch {
    return null;
  }
}

export function serializeProjectRecovery(state: RecoverableProjectState): string {
  return JSON.stringify(state);
}
