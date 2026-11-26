import { calculateBatchExportTiming } from '@/components/video-editor/batchExportTiming';
import type { ClipQueueItem } from '@/components/video-editor/clipQueue';

const clips: ClipQueueItem[] = [
  { id: 'a', name: 'intro', start: 0, end: 5 },
  { id: 'b', name: 'outro', start: 10, end: 20 },
];

describe('observed batch export timing', () => {
  it('compares overall elapsed time with successfully exported clip duration', () => {
    expect(calculateBatchExportTiming(1000, 7000, clips, [])).toEqual({
      processingSeconds: 6,
      clipSeconds: 15,
      processingToClipRatio: 0.4,
      successfulClips: 2,
      attemptedClips: 2,
      failedClips: 0,
    });
  });

  it('excludes failed clip durations and reports partial exports', () => {
    expect(calculateBatchExportTiming(1000, 7000, clips, ['b'])).toEqual({
      processingSeconds: 6,
      clipSeconds: 5,
      processingToClipRatio: 1.2,
      successfulClips: 1,
      attemptedClips: 2,
      failedClips: 1,
    });
  });

  it('does not claim timing for all failed or invalid batches', () => {
    expect(calculateBatchExportTiming(100, 200, clips, ['a', 'b'])).toBeNull();
    expect(calculateBatchExportTiming(100, 200, [], [])).toBeNull();
    expect(calculateBatchExportTiming(100, 100, clips, [])).toBeNull();
    expect(calculateBatchExportTiming(100, 200, clips, ['a', 'a'])).toBeNull();
    expect(calculateBatchExportTiming(100, 200, [{ ...clips[0], end: 0 }], [])).toBeNull();
  });
});
