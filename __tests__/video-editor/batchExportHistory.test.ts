import { runBatchExport } from '@/components/video-editor/batchExport';
import { EXPORT_HISTORY_KEY, parseExportHistory } from '@/components/video-editor/exportHistory';
import type { ClipQueueItem } from '@/components/video-editor/clipQueue';

const clips: ClipQueueItem[] = [
  { id: 'one', name: 'one', start: 0, end: 10 },
  { id: 'two', name: 'two', start: 10, end: 20 },
];

describe('batch export history integration', () => {
  beforeEach(() => window.localStorage.clear());

  it('records the completed batch result after processing all clips', async () => {
    await runBatchExport(clips, async (clip) => {
      if (clip.id === 'two') throw new Error('failed two');
      return new File(['ok'], 'one.mp4');
    });

    const history = parseExportHistory(window.localStorage.getItem(EXPORT_HISTORY_KEY));
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ clipCount: 2, successCount: 1, failureCount: 1, successfulFiles: ['one.mp4'] });
    expect(history[0].failedClips).toEqual([{ name: 'two', message: 'failed two' }]);
  });
});
