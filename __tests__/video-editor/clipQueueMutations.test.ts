import {
  appendClipQueueItem,
  removeClipQueueItem,
  removeFailedClipId,
  renameClipQueueItem,
  selectFailedClips,
} from '@/components/video-editor/clipQueueMutations';
import type { ClipExportSettings, ClipQueueItem } from '@/components/video-editor/clipQueue';

const settings: ClipExportSettings = {
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
};

const items: ClipQueueItem[] = [
  { id: 'a', name: 'one', start: 1, end: 5 },
  { id: 'b', name: 'two', start: 5, end: 9 },
];

describe('clip queue mutations', () => {
  it('appends a new clip using the current queue length for naming', () => {
    const result = appendClipQueueItem(items, 9, 12, settings);
    expect(result).toHaveLength(3);
    expect(result[2].name).toBe('clip-03');
    expect(result[2].start).toBe(9);
    expect(result[2].end).toBe(12);
    expect(result[2].settings).toBe(settings);
    expect(items).toHaveLength(2);
  });

  it('renames only the matching clip without mutating the input array', () => {
    const result = renameClipQueueItem(items, 'b', 'renamed');
    expect(result).toEqual([
      items[0],
      { ...items[1], name: 'renamed' },
    ]);
    expect(items[1].name).toBe('two');
  });

  it('removes a clip and its failed id independently', () => {
    expect(removeClipQueueItem(items, 'a')).toEqual([items[1]]);
    expect(removeFailedClipId(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('selects only failed clips in queue order', () => {
    expect(selectFailedClips(items, ['b', 'missing'])).toEqual([items[1]]);
  });
});
