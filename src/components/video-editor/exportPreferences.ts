import type { ExportQuality } from './editorConfig';

export const EXPORT_PREFERENCES_KEY = 'video-short-converter:export-preferences';

export interface ExportPreferences {
  presetId?: string;
  cropPosition?: number;
  cropPositionY?: number;
  quality?: ExportQuality;
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export function parseExportPreferences(raw: string | null): ExportPreferences {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw) as Partial<ExportPreferences>;
    return {
      ...(typeof value.presetId === 'string' && value.presetId ? { presetId: value.presetId } : {}),
      ...(typeof value.cropPosition === 'number' && Number.isFinite(value.cropPosition) ? { cropPosition: clampPercent(value.cropPosition) } : {}),
      ...(typeof value.cropPositionY === 'number' && Number.isFinite(value.cropPositionY) ? { cropPositionY: clampPercent(value.cropPositionY) } : {}),
      ...(['standard', 'high', 'maximum'].includes(value.quality ?? '') ? { quality: value.quality as ExportQuality } : {}),
    };
  } catch {
    return {};
  }
}

export function serializeExportPreferences(preferences: Required<ExportPreferences>): string {
  return JSON.stringify(preferences);
}
