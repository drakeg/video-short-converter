import { resolveSourceSelection } from '@/components/video-editor/sourceSelection';
import type { RecoverableProjectState } from '@/components/video-editor/projectRecovery';

const recovery: RecoverableProjectState = {
  source: { name: 'trip.mp4', size: 100, lastModified: 1234 },
  savedAt: 2000,
  startTime: 10,
  endTime: 25,
  presetId: 'youtube-short',
  cropPosition: 50,
  cropPositionY: 50,
  quality: 'standard',
  frameRate: 30,
  muted: false,
  gainDb: 0,
  normalize: false,
  fadeIn: 0,
  fadeOut: 0,
  captionStyle: { size: 'medium', position: 'bottom', backdrop: true },
  burnCaptions: false,
  clipQueue: [{ id: 'clip-1', name: 'clip', start: 10, end: 25 }],
};

describe('resolveSourceSelection', () => {
  it('rejects invalid video files before touching recovery state', () => {
    const file = new File([], 'empty.mp4', { type: 'video/mp4', lastModified: 1234 });
    expect(resolveSourceSelection(file, recovery)).toEqual({
      ok: false,
      error: 'This video file is empty.',
    });
  });

  it('restores matching recovery state and queue metadata', () => {
    const file = new File([new Uint8Array(100)], 'trip.mp4', { type: 'video/mp4', lastModified: 1234 });
    expect(resolveSourceSelection(file, recovery)).toEqual({
      ok: true,
      recovery,
      startTime: 10,
      endTime: 25,
      trimDuration: 15,
      clipQueue: recovery.clipQueue,
      warning: 'Recovered your saved edit for trip.mp4.',
    });
  });

  it('starts clean when source metadata does not match pending recovery', () => {
    const file = new File([new Uint8Array(101)], 'trip.mp4', { type: 'video/mp4', lastModified: 1234 });
    expect(resolveSourceSelection(file, recovery)).toEqual({
      ok: true,
      recovery: null,
      startTime: null,
      endTime: null,
      trimDuration: 0,
      clipQueue: [],
      warning: null,
    });
  });

  it('preserves validation warnings when no recovery is applied', () => {
    const largeSize = 500 * 1024 * 1024;
    const file = { name: 'large.mp4', size: largeSize, type: 'video/mp4', lastModified: 1 } as File;
    const result = resolveSourceSelection(file, null);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.warning).toContain('large video');
    }
  });
});
