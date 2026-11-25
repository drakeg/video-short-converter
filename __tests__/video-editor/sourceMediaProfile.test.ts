import { profileSourceMedia } from '@/components/video-editor/sourceMediaProfile';

describe('source media diagnostics', () => {
  it('returns null before usable source metadata is known', () => {
    expect(profileSourceMedia(1024, 0, 1920, 1080)).toBeNull();
    expect(profileSourceMedia(1024, 10, 0, 1080)).toBeNull();
    expect(profileSourceMedia(Number.NaN, 10, 1920, 1080)).toBeNull();
  });

  it('derives exact file-based metadata without claiming memory or processing speed', () => {
    const profile = profileSourceMedia(10_000_000, 10, 1920, 1080);
    expect(profile).toEqual({
      fileSizeMiB: 10_000_000 / (1024 * 1024),
      durationSeconds: 10,
      width: 1920,
      height: 1080,
      megapixelsPerFrame: 2.0736,
      averageMbps: 8,
      warnings: [],
    });
  });

  it('warns about large, high-resolution and long sources independently', () => {
    const profile = profileSourceMedia(500 * 1024 * 1024, 1800, 3840, 2160);
    expect(profile?.warnings).toHaveLength(3);
    expect(profile?.warnings.join(' ')).toMatch(/memory|resources|short range/);
  });

  it('does not flag smaller video solely because it is 1080p', () => {
    expect(profileSourceMedia(100 * 1024 * 1024, 240, 1920, 1080)?.warnings).toEqual([]);
  });
});
