export function formatEditorTime(seconds: number): string {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toFixed(1).padStart(4, '0')}`;
}

export function normalizeProcessingProgress(progress: number): number {
  const normalized = progress > 1 ? progress / 100 : progress;
  return Math.min(0.99, Math.max(0, normalized));
}

export function calculateBatchProgress(
  clipIndex: number,
  totalClips: number,
  clipProgress: number,
): number {
  if (totalClips <= 0) return 0;
  const normalized = Math.min(1, Math.max(0, clipProgress > 1 ? clipProgress / 100 : clipProgress));
  return (clipIndex + normalized) / totalClips;
}

export function calculateOpenTrimDuration(currentTime: number, startTime: number): number {
  return Math.max(0, currentTime - startTime);
}
