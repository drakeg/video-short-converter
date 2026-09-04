import { buildCaptionOverlayFilter, getCaptionFontSize } from '@/components/video-editor/captionBurnIn';

describe('caption burn-in planning', () => {
  it('scales caption size with output height', () => {
    expect(getCaptionFontSize({ size: 'small', position: 'bottom', backdrop: true }, 1920)).toBeLessThan(
      getCaptionFontSize({ size: 'large', position: 'bottom', backdrop: true }, 1920),
    );
    expect(getCaptionFontSize({ size: 'medium', position: 'bottom', backdrop: true }, 1080)).toBeGreaterThanOrEqual(24);
  });

  it('builds a deterministic overlay chain for rebased cues', () => {
    const plan = buildCaptionOverlayFilter('scale=1080:1920', [
      { start: 0, end: 2.5, text: 'First' },
      { start: 3, end: 5, text: 'Second' },
    ]);
    expect(plan.filter).toContain('[0:v]scale=1080:1920,setpts=PTS-STARTPTS[v0]');
    expect(plan.filter).toContain("[v0][cap0]overlay=0:0:enable='between(t,0.000,2.500)'[v1]");
    expect(plan.filter).toContain("[v1][cap1]overlay=0:0:enable='between(t,3.000,5.000)'[v2]");
    expect(plan.outputLabel).toBe('[v2]');
  });

  it('keeps the normal video filter when no captions are present', () => {
    expect(buildCaptionOverlayFilter('scale=1080:1920', [])).toEqual({ filter: 'scale=1080:1920', outputLabel: '' });
  });
});
