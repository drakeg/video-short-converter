/** Observed wall-clock time for one successful in-browser clip export. */
export interface LocalExportTiming {
  processingSeconds: number;
  clipSeconds: number;
  processingToClipRatio: number;
}

export function calculateLocalExportTiming(startedMs: number, finishedMs: number, clipSeconds: number): LocalExportTiming | null {
  if (![startedMs, finishedMs, clipSeconds].every(Number.isFinite) ||
    finishedMs <= startedMs || clipSeconds <= 0) return null;
  const processingSeconds = (finishedMs - startedMs) / 1000;
  return {
    processingSeconds,
    clipSeconds,
    processingToClipRatio: processingSeconds / clipSeconds,
  };
}
