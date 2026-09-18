export interface TrimRange {
  startTime: number | null;
  endTime: number | null;
  duration: number;
}

export function normalizeLoadedTrimRange(
  startTime: number | null,
  endTime: number | null,
  duration: number,
): TrimRange {
  const nextStart = startTime === null ? null : Math.max(0, Math.min(startTime, duration));
  const nextEnd = endTime === null ? duration : Math.max(nextStart ?? 0, Math.min(endTime, duration));
  return {
    startTime: nextStart,
    endTime: nextEnd,
    duration: Math.max(0, nextEnd - (nextStart ?? 0)),
  };
}

export function updateTrimStart(
  requestedStart: number,
  endTime: number | null,
  duration: number,
): TrimRange {
  const boundedStart = Math.max(0, Math.min(requestedStart, endTime ?? duration));
  const effectiveEnd = endTime ?? duration;
  return {
    startTime: boundedStart,
    endTime,
    duration: Math.max(0, effectiveEnd - boundedStart),
  };
}

export function updateTrimEnd(
  requestedEnd: number,
  startTime: number | null,
  duration: number,
): TrimRange {
  const effectiveStart = startTime ?? 0;
  const boundedEnd = Math.max(effectiveStart, Math.min(requestedEnd, duration));
  return {
    startTime: effectiveStart,
    endTime: boundedEnd,
    duration: Math.max(0, boundedEnd - effectiveStart),
  };
}

export function selectTrimRange(startTime: number, endTime: number): TrimRange {
  return {
    startTime,
    endTime,
    duration: Math.max(0, endTime - startTime),
  };
}
