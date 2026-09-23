import { normalizeLoadedTrimRange } from './trimRange';

export interface LoadedMediaState {
  duration: number;
  sourceWidth: number;
  sourceHeight: number;
  startTime: number | null;
  endTime: number | null;
  trimDuration: number;
}

export function resolveLoadedMediaState(
  media: Pick<HTMLVideoElement, 'duration' | 'videoWidth' | 'videoHeight'>,
  startTime: number | null,
  endTime: number | null,
): LoadedMediaState {
  const range = normalizeLoadedTrimRange(startTime, endTime, media.duration);
  return {
    duration: media.duration,
    sourceWidth: media.videoWidth,
    sourceHeight: media.videoHeight,
    startTime: range.startTime,
    endTime: range.endTime,
    trimDuration: range.duration,
  };
}
