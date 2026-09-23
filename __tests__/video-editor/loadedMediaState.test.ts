import { resolveLoadedMediaState } from '@/components/video-editor/loadedMediaState';

describe('resolveLoadedMediaState', () => {
  it('returns media dimensions/duration and a normalized trim range', () => {
    expect(resolveLoadedMediaState(
      { duration: 120, videoWidth: 1920, videoHeight: 1080 },
      10,
      30,
    )).toEqual({
      duration: 120,
      sourceWidth: 1920,
      sourceHeight: 1080,
      startTime: 10,
      endTime: 30,
      trimDuration: 20,
    });
  });

  it('clamps recovered trim points to the loaded duration', () => {
    expect(resolveLoadedMediaState(
      { duration: 20, videoWidth: 1280, videoHeight: 720 },
      10,
      40,
    )).toEqual({
      duration: 20,
      sourceWidth: 1280,
      sourceHeight: 720,
      startTime: 10,
      endTime: 20,
      trimDuration: 10,
    });
  });

  it('preserves an open-ended start mark after metadata loads', () => {
    expect(resolveLoadedMediaState(
      { duration: 60, videoWidth: 640, videoHeight: 360 },
      12,
      null,
    )).toEqual({
      duration: 60,
      sourceWidth: 640,
      sourceHeight: 360,
      startTime: 12,
      endTime: null,
      trimDuration: 0,
    });
  });
});
