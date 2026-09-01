import {
  buildVideoFilter,
  clampCropPosition,
  getExportPreset,
} from '@/components/video-editor/editorConfig';

describe('editor export configuration', () => {
  it('keeps crop positions within the supported range', () => {
    expect(clampCropPosition(-25)).toBe(0);
    expect(clampCropPosition(50)).toBe(50);
    expect(clampCropPosition(125)).toBe(100);
  });

  it('builds a positioned portrait crop for short-form presets', () => {
    const filter = buildVideoFilter({ presetId: 'youtube-short', cropPosition: 75 });

    expect(filter).toContain('crop=');
    expect(filter).toContain('(iw-ow)*0.75');
    expect(filter).toContain('scale=1080:1920');
  });

  it('uses a fit-and-pad filter for landscape passthrough', () => {
    const filter = buildVideoFilter({ presetId: 'landscape', cropPosition: 0 });

    expect(filter).toBe(
      'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2',
    );
  });

  it('falls back to the default preset for unknown ids', () => {
    expect(getExportPreset('missing').id).toBe('youtube-short');
  });
});
