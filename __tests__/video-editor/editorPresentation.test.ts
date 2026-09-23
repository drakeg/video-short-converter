import {
  calculateBatchProgress,
  calculateOpenTrimDuration,
  formatEditorTime,
  normalizeProcessingProgress,
} from '@/components/video-editor/editorPresentation';

describe('editor presentation helpers', () => {
  it('formats editor times with minutes and tenths of a second', () => {
    expect(formatEditorTime(0)).toBe('00:00.0');
    expect(formatEditorTime(65.4)).toBe('01:05.4');
    expect(formatEditorTime(600.05)).toBe('10:00.1');
  });

  it('normalizes fractional and percentage processing progress into preview range', () => {
    expect(normalizeProcessingProgress(-1)).toBe(0);
    expect(normalizeProcessingProgress(0.5)).toBe(0.5);
    expect(normalizeProcessingProgress(50)).toBe(0.5);
    expect(normalizeProcessingProgress(100)).toBe(0.99);
    expect(normalizeProcessingProgress(150)).toBe(0.99);
  });

  it('calculates batch progress from clip index and per-clip progress', () => {
    expect(calculateBatchProgress(0, 4, 0.5)).toBe(0.125);
    expect(calculateBatchProgress(1, 4, 50)).toBe(0.375);
    expect(calculateBatchProgress(3, 4, 100)).toBe(1);
    expect(calculateBatchProgress(0, 0, 0.5)).toBe(0);
  });

  it('keeps open-ended trim duration non-negative', () => {
    expect(calculateOpenTrimDuration(15, 10)).toBe(5);
    expect(calculateOpenTrimDuration(8, 10)).toBe(0);
  });
});
