import { buildClipFileName, createClipQueueItem, sanitizeClipName, type ClipExportSettings } from '@/components/video-editor/clipQueue';

const settings: ClipExportSettings = {
  presetId: 'tiktok',
  cropPosition: 35,
  cropPositionY: 60,
  quality: 'high',
  frameRate: 29.97,
  muted: false,
  gainDb: 2,
  normalize: true,
  fadeIn: 0.5,
  fadeOut: 1,
  captionStyle: { size: 'large', position: 'top', backdrop: false },
  burnCaptions: true,
};

describe('clip queue helpers', () => {
  it('creates sequential default names', () => {
    const clip = createClipQueueItem(10, 42, 2);
    expect(clip.name).toBe('clip-03');
    expect(clip.start).toBe(10);
    expect(clip.end).toBe(42);
  });

  it('snapshots independent export settings when supplied', () => {
    const clip = createClipQueueItem(10, 42, 0, 'intro', settings);
    expect(clip.settings).toEqual(settings);
  });

  it('keeps legacy queue items compatible when no settings are supplied', () => {
    expect(createClipQueueItem(10, 42, 0).settings).toBeUndefined();
  });

  it('rejects invalid ranges', () => {
    expect(() => createClipQueueItem(20, 20, 0)).toThrow('valid start and end');
  });

  it('sanitizes user-facing names and builds deterministic filenames', () => {
    expect(sanitizeClipName('  Great Clip! #1  ')).toBe('Great-Clip-1');
    expect(buildClipFileName('My Long Video.MOV', 'Great Clip #1')).toBe('My-Long-Video-Great-Clip-1.mp4');
  });
});
