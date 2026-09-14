import { buildEditorExportSettings } from '@/components/video-editor/editorExportSettings';

const input = {
  presetId: 'youtube-short',
  cropPosition: 42,
  cropPositionY: 61,
  quality: 'high' as const,
  frameRate: 29.97,
  muted: false,
  gainDb: 2,
  normalize: true,
  fadeIn: 0.5,
  fadeOut: 1,
  captionStyle: { size: 'large' as const, position: 'bottom' as const, backdrop: true },
  burnCaptions: true,
};

describe('editor export settings snapshot', () => {
  it('captures every export-affecting editor setting in one typed snapshot', () => {
    expect(buildEditorExportSettings(input)).toEqual(input);
  });

  it('copies nested caption style so later editor mutations cannot change a queued snapshot', () => {
    const snapshot = buildEditorExportSettings(input);
    input.captionStyle.backdrop = false;
    expect(snapshot.captionStyle.backdrop).toBe(true);
  });
});
