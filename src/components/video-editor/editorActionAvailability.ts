export function hasValidTrimRange(
  startTime: number | null,
  endTime: number | null,
): boolean {
  return startTime !== null && endTime !== null && endTime > startTime;
}

export function canProcessCurrentClip(
  sourceLoaded: boolean,
  isProcessing: boolean,
  startTime: number | null,
  endTime: number | null,
): boolean {
  return sourceLoaded && !isProcessing && hasValidTrimRange(startTime, endTime);
}

export function canAddCurrentClip(
  startTime: number | null,
  endTime: number | null,
): boolean {
  return hasValidTrimRange(startTime, endTime);
}

export function canExportTargetClips(
  sourceLoaded: boolean,
  isProcessing: boolean,
  targetClipCount: number,
): boolean {
  return sourceLoaded && !isProcessing && targetClipCount > 0;
}
