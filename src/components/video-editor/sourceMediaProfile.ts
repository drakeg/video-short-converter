/** Metadata-only source diagnostics. These values do not estimate RAM usage or encoding speed. */
export interface SourceMediaProfile {
  fileSizeMiB: number;
  durationSeconds: number;
  width: number;
  height: number;
  megapixelsPerFrame: number;
  averageMbps: number | null;
  warnings: string[];
}

export function profileSourceMedia(fileSizeBytes: number, durationSeconds: number, width: number, height: number): SourceMediaProfile | null {
  if (![fileSizeBytes, durationSeconds, width, height].every(Number.isFinite) ||
    fileSizeBytes <= 0 || durationSeconds <= 0 || width <= 0 || height <= 0) return null;
  const megapixelsPerFrame = width * height / 1_000_000;
  const warnings: string[] = [];
  if (fileSizeBytes >= 500 * 1024 * 1024) {
    warnings.push('Large source file: browser-local processing may require substantial memory.');
  }
  if (megapixelsPerFrame >= 8) {
    warnings.push('High-resolution source: preview and export may require more device resources.');
  }
  if (durationSeconds >= 30 * 60) {
    warnings.push('Long source: consider testing a short range before exporting a large clip queue.');
  }
  return {
    fileSizeMiB: fileSizeBytes / (1024 * 1024),
    durationSeconds, width, height, megapixelsPerFrame,
    averageMbps: fileSizeBytes * 8 / durationSeconds / 1_000_000,
    warnings,
  };
}
