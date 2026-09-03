import { buildClipFileName, createClipQueueItem, sanitizeClipName } from '@/components/video-editor/clipQueue';

describe('clip queue helpers', () => {
  it('creates sequential default names', () => {
    const clip = createClipQueueItem(10, 42, 2);
    expect(clip.name).toBe('clip-03');
    expect(clip.start).toBe(10);
    expect(clip.end).toBe(42);
  });

  it('rejects invalid ranges', () => {
    expect(() => createClipQueueItem(20, 20, 0)).toThrow('valid start and end');
  });

  it('sanitizes user-facing names and builds deterministic filenames', () => {
    expect(sanitizeClipName('  Great Clip! #1  ')).toBe('Great-Clip-1');
    expect(buildClipFileName('My Long Video.MOV', 'Great Clip #1')).toBe('My-Long-Video-Great-Clip-1.mp4');
  });
});
