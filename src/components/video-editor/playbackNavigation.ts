export function clampPlaybackTime(time: number, duration: number): number {
  return Math.max(0, Math.min(time, duration || 0));
}

export function offsetPlaybackTime(currentTime: number, offsetSeconds: number, duration: number): number {
  return clampPlaybackTime(currentTime + offsetSeconds, duration);
}

export function frameOffsetSeconds(frameCount: number, frameRate: number): number {
  return frameCount / frameRate;
}

export function normalizeMarkStart(currentTime: number): number {
  return currentTime < 0.5 ? 0 : currentTime;
}

export function normalizeMarkEnd(currentTime: number, startTime: number | null): {
  startTime: number;
  endTime: number;
  duration: number;
} {
  const effectiveStart = startTime ?? 0;
  const endTime = Math.max(effectiveStart, currentTime);
  return {
    startTime: effectiveStart,
    endTime,
    duration: endTime - effectiveStart,
  };
}
