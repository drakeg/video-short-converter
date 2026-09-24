import { resolveEditorStartupState } from '@/components/video-editor/editorStartupState';

describe('editor startup state', () => {
  it('maps hydrated preferences and pending recovery into editor startup state', () => {
    const pendingRecovery = {
      source: { name: 'source.mov', size: 100, lastModified: 123 },
      startTime: 2,
      endTime: 8,
      settings: {
        presetId: 'youtube-short',
        cropPosition: 50,
        cropPositionY: 50,
        quality: 'standard' as const,
        frameRate: 30,
        muted: false,
        gainDb: 0,
        normalize: false,
        fadeIn: 0,
        fadeOut: 0,
        captionStyle: { size: 'medium' as const, position: 'bottom' as const, backdrop: true },
        burnCaptions: false,
      },
      clipQueue: [],
    };

    expect(resolveEditorStartupState({
      preferences: { presetId: 'square', cropPosition: 0, cropPositionY: 100, quality: 'high' },
      pendingRecovery,
    })).toEqual({
      presetId: 'square',
      cropPosition: 0,
      cropPositionY: 100,
      quality: 'high',
      pendingRecovery,
    });
  });

  it('omits absent preferences while preserving a null recovery', () => {
    expect(resolveEditorStartupState({ preferences: {}, pendingRecovery: null })).toEqual({
      pendingRecovery: null,
    });
  });
});
