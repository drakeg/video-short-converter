import { appendExportHistory, buildExportHistoryEntry, parseExportHistory } from '@/components/video-editor/exportHistory';
import type { ClipQueueItem } from '@/components/video-editor/clipQueue';

const clips: ClipQueueItem[] = [
  { id: 'one', name: 'intro', start: 0, end: 30 },
  { id: 'two', name: 'outro', start: 30, end: 60 },
];

describe('export history', () => {
  it('summarizes successful files and failures without storing video bytes', () => {
    const entry = buildExportHistoryEntry(
      clips,
      [new File(['video-bytes'], 'intro.mp4')],
      [{ clip: clips[1], message: 'encoder failed' }],
      new Date('2026-09-13T20:00:00.000Z'),
    );

    expect(entry).toEqual({
      id: '2026-09-13T20:00:00.000Z:one,two',
      exportedAt: '2026-09-13T20:00:00.000Z',
      clipCount: 2,
      successCount: 1,
      failureCount: 1,
      successfulFiles: ['intro.mp4'],
      failedClips: [{ name: 'outro', message: 'encoder failed' }],
    });
    expect(JSON.stringify(entry)).not.toContain('video-bytes');
  });

  it('keeps only the ten most recent entries', () => {
    let entries = [] as ReturnType<typeof parseExportHistory>;
    for (let index = 0; index < 12; index++) {
      entries = appendExportHistory(entries, {
        id: String(index), exportedAt: new Date(index * 1000).toISOString(), clipCount: 1, successCount: 1, failureCount: 0, successfulFiles: [`${index}.mp4`], failedClips: [],
      });
    }
    expect(entries).toHaveLength(10);
    expect(entries[0].id).toBe('11');
    expect(entries.at(-1)?.id).toBe('2');
  });

  it('rejects malformed persisted history safely', () => {
    expect(parseExportHistory('not json')).toEqual([]);
    expect(parseExportHistory(JSON.stringify([{ id: 1 }]))).toEqual([]);
  });
});
