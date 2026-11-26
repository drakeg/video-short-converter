import { calculateLocalExportTiming } from '@/components/video-editor/localExportTiming';

describe('observed local export timing', () => {
  it('records observed processing seconds and comparison to clip duration', () => {
    expect(calculateLocalExportTiming(100, 5100, 10)).toEqual({
      processingSeconds: 5,
      clipSeconds: 10,
      processingToClipRatio: 0.5,
    });
  });

  it('does not report an unmeasured, zero-length, or invalid export', () => {
    expect(calculateLocalExportTiming(100, 100, 10)).toBeNull();
    expect(calculateLocalExportTiming(500, 100, 10)).toBeNull();
    expect(calculateLocalExportTiming(100, 200, 0)).toBeNull();
    expect(calculateLocalExportTiming(Number.NaN, 200, 5)).toBeNull();
    expect(calculateLocalExportTiming(100, Number.POSITIVE_INFINITY, 5)).toBeNull();
  });
});
