import {
  canAddCurrentClip,
  canExportTargetClips,
  canProcessCurrentClip,
  hasValidTrimRange,
} from '@/components/video-editor/editorActionAvailability';

describe('editor action availability', () => {
  it.each([
    [null, null, false],
    [1, null, false],
    [null, 2, false],
    [2, 2, false],
    [3, 2, false],
    [1, 2, true],
  ])('validates trim range start=%s end=%s', (start, end, expected) => {
    expect(hasValidTrimRange(start, end)).toBe(expected);
  });

  it('allows processing only with a source, idle state, and valid trim range', () => {
    expect(canProcessCurrentClip(true, false, 1, 2)).toBe(true);
    expect(canProcessCurrentClip(false, false, 1, 2)).toBe(false);
    expect(canProcessCurrentClip(true, true, 1, 2)).toBe(false);
    expect(canProcessCurrentClip(true, false, 2, 1)).toBe(false);
  });

  it('uses the same trim validity rule for adding a queue item', () => {
    expect(canAddCurrentClip(1, 2)).toBe(true);
    expect(canAddCurrentClip(2, 2)).toBe(false);
  });

  it('allows batch export only with a source, idle state, and at least one target clip', () => {
    expect(canExportTargetClips(true, false, 1)).toBe(true);
    expect(canExportTargetClips(false, false, 1)).toBe(false);
    expect(canExportTargetClips(true, true, 1)).toBe(false);
    expect(canExportTargetClips(true, false, 0)).toBe(false);
  });
});
