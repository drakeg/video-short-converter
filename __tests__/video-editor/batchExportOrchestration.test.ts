import { executeBatchExport } from '@/components/video-editor/batchExportOrchestration';
import type { ClipQueueItem } from '@/components/video-editor/clipQueue';

const clips: ClipQueueItem[] = [
  { id: 'one', name: 'intro', start: 0, end: 10 },
  { id: 'two', name: 'outro', start: 10, end: 20 },
];

describe('batch export orchestration', () => {
  beforeEach(() => window.localStorage.clear());

  it('returns a direct download for one successful queued clip', async () => {
    const rendered = new File(['video'], 'intro.mp4', { type: 'video/mp4' });
    const result = await executeBatchExport({
      sourceFile: new File(['source'], 'source.mov'),
      clips: [clips[0]],
      renderClip: async () => rendered,
    });

    expect(result.download).toBe(rendered);
    expect(result.failedClipIds).toEqual([]);
    expect(result.error).toBeNull();
    expect(result.status).toBe('Exported 1 clip.');
  });

  it('packages partial multi-clip success and preserves failure messaging', async () => {
    const packaging = jest.fn();
    const result = await executeBatchExport({
      sourceFile: new File(['source'], 'source.mov'),
      clips,
      onPackagingStatus: packaging,
      renderClip: async (clip) => {
        if (clip.id === 'two') throw new Error('encoder failed');
        return new File(['video'], 'intro.mp4', { type: 'video/mp4' });
      },
    });

    expect(packaging).toHaveBeenCalledWith('Packaging 1 successful clip and export manifest into one ZIP...');
    expect(result.download?.name).toMatch(/\.zip$/);
    expect(result.failedClipIds).toEqual(['two']);
    expect(result.error).toBeNull();
    expect(result.status).toContain('Exported 1 clip as');
    expect(result.status).toContain('1 clip failed: outro. Retry is available below.');
  });

  it('returns an actionable error when every clip fails', async () => {
    const result = await executeBatchExport({
      sourceFile: new File(['source'], 'source.mov'),
      clips,
      renderClip: async () => { throw new Error('encoder failed'); },
    });

    expect(result.download).toBeNull();
    expect(result.failedClipIds).toEqual(['one', 'two']);
    expect(result.error).toBe('2 clips failed: intro, outro');
    expect(result.status).toBe('No clips were exported. Use Retry failed clips after adjusting the affected ranges or settings.');
  });
});
