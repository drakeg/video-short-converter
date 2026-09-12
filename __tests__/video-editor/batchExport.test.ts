import { formatBatchFailureSummary, runBatchExport } from '@/components/video-editor/batchExport';
import type { ClipQueueItem } from '@/components/video-editor/clipQueue';

const clips: ClipQueueItem[] = [
  { id: 'one', name: 'one', start: 0, end: 10 },
  { id: 'two', name: 'two', start: 10, end: 20 },
  { id: 'three', name: 'three', start: 20, end: 30 },
];

describe('resilient batch export', () => {
  it('keeps successful files when another clip fails', async () => {
    const result = await runBatchExport(clips, async (clip) => {
      if (clip.id === 'two') throw new Error('encoder failed');
      return new File([clip.id], `${clip.name}.mp4`, { type: 'video/mp4' });
    });

    expect(result.files.map((file) => file.name)).toEqual(['one.mp4', 'three.mp4']);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toMatchObject({ clip: clips[1], message: 'encoder failed' });
  });

  it('continues after multiple failures and preserves failure order', async () => {
    const result = await runBatchExport(clips, async (clip) => {
      if (clip.id !== 'two') throw new Error(`failed ${clip.id}`);
      return new File(['ok'], 'two.mp4');
    });

    expect(result.files.map((file) => file.name)).toEqual(['two.mp4']);
    expect(result.failures.map(({ clip }) => clip.id)).toEqual(['one', 'three']);
    expect(formatBatchFailureSummary(result.failures)).toBe('2 clips failed: one, three');
  });

  it('returns an empty failure summary when every clip succeeds', async () => {
    expect(formatBatchFailureSummary([])).toBe('');
  });
});
