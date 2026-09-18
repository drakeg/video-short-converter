import {
  clampPlaybackTime,
  frameOffsetSeconds,
  normalizeMarkEnd,
  normalizeMarkStart,
  offsetPlaybackTime,
} from '@/components/video-editor/playbackNavigation';

describe('playback navigation helpers', () => {
  it('clamps seek targets to the loaded media duration', () => {
    expect(clampPlaybackTime(-5, 120)).toBe(0);
    expect(clampPlaybackTime(45, 120)).toBe(45);
    expect(clampPlaybackTime(150, 120)).toBe(120);
    expect(clampPlaybackTime(10, 0)).toBe(0);
  });

  it('applies quick-jump offsets before clamping', () => {
    expect(offsetPlaybackTime(3, -5, 60)).toBe(0);
    expect(offsetPlaybackTime(58, 5, 60)).toBe(60);
    expect(offsetPlaybackTime(20, 5, 60)).toBe(25);
  });

  it('converts frame steps to seconds using the selected frame rate', () => {
    expect(frameOffsetSeconds(1, 30)).toBeCloseTo(1 / 30);
    expect(frameOffsetSeconds(-2, 60)).toBeCloseTo(-2 / 60);
  });

  it('snaps near-zero mark-in positions to zero', () => {
    expect(normalizeMarkStart(0.49)).toBe(0);
    expect(normalizeMarkStart(0.5)).toBe(0.5);
  });

  it('materializes a zero start for mark-out and never ends before start', () => {
    expect(normalizeMarkEnd(12, null)).toEqual({
      startTime: 0,
      endTime: 12,
      duration: 12,
    });
    expect(normalizeMarkEnd(8, 10)).toEqual({
      startTime: 10,
      endTime: 10,
      duration: 0,
    });
  });
});
