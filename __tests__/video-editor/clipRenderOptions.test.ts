import { buildActiveRenderOptions, buildClipRenderOptions } from '@/components/video-editor/clipRenderOptions';
import type { ClipExportSettings, ClipQueueItem } from '@/components/video-editor/clipQueue';
import type { TranscriptCue } from '@/components/video-editor/transcript';

const current: ClipExportSettings = {
  presetId: 'youtube-short',
  cropPosition: 50,
  cropPositionY: 40,
  quality: 'standard',
  frameRate: 30,
  muted: false,
  gainDb: 1,
  normalize: false,
  fadeIn: 0.2,
  fadeOut: 0.3,
  captionStyle: { size: 'medium', position: 'bottom', backdrop: true },
  burnCaptions: false,
};

const cues: TranscriptCue[] = [
  { start: 2, end: 5, text: 'before' },
  { start: 11, end: 13, text: 'inside' },
  { start: 18, end: 22, text: 'overlap' },
  { start: 25, end: 30, text: 'after' },
];

describe('clip render option resolution', () => {
  it('builds active render options from the current editor settings', () => {
    const result = buildActiveRenderOptions(current, 10, 20, cues);

    expect(result.video).toEqual({ presetId: 'youtube-short', cropPosition: 50, cropPositionY: 40, quality: 'standard', frameRate: 30 });
    expect(result.audio).toEqual({ muted: false, gainDb: 1, normalize: false, fadeIn: 0.2, fadeOut: 0.3 });
    expect(result.output).toEqual({});
    expect(result.captions).toEqual({
      enabled: false,
      cues: [
        { start: 1, end: 3, text: 'inside' },
        { start: 8, end: 10, text: 'overlap' },
      ],
      style: current.captionStyle,
    });
  });

  it('uses current editor settings for legacy queue items and scopes captions to the clip', () => {
    const clip: ClipQueueItem = { id: 'legacy', name: 'Intro / Hook', start: 10, end: 20 };
    const result = buildClipRenderOptions(clip, 0, current, cues);

    expect(result.video).toEqual({ presetId: 'youtube-short', cropPosition: 50, cropPositionY: 40, quality: 'standard', frameRate: 30 });
    expect(result.audio).toEqual({ muted: false, gainDb: 1, normalize: false, fadeIn: 0.2, fadeOut: 0.3 });
    expect(result.output.clipName).toBe('Intro-Hook');
    expect(result.captions.enabled).toBe(false);
    expect(result.captions.style).toEqual(current.captionStyle);
    expect(result.captions.cues).toEqual([
      { start: 1, end: 3, text: 'inside' },
      { start: 8, end: 10, text: 'overlap' },
    ]);
  });

  it('prefers a queued clip settings snapshot over current editor settings', () => {
    const saved: ClipExportSettings = {
      presetId: 'instagram-reel',
      cropPosition: 12,
      cropPositionY: 77,
      quality: 'maximum',
      frameRate: 60,
      muted: true,
      gainDb: -2,
      normalize: true,
      fadeIn: 1,
      fadeOut: 2,
      captionStyle: { size: 'large', position: 'top', backdrop: false },
      burnCaptions: true,
    };
    const clip: ClipQueueItem = { id: 'saved', name: 'Saved', start: 10, end: 20, settings: saved };
    const result = buildClipRenderOptions(clip, 1, current, cues);

    expect(result.video).toEqual({ presetId: 'instagram-reel', cropPosition: 12, cropPositionY: 77, quality: 'maximum', frameRate: 60 });
    expect(result.audio).toEqual({ muted: true, gainDb: -2, normalize: true, fadeIn: 1, fadeOut: 2 });
    expect(result.captions.enabled).toBe(true);
    expect(result.captions.style).toEqual(saved.captionStyle);
  });
});
