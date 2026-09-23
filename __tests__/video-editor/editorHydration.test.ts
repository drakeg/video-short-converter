import { hydrateEditorPersistence } from '@/components/video-editor/editorHydration';
import { serializeProjectRecovery, type RecoverableProjectState } from '@/components/video-editor/projectRecovery';

const recovery: RecoverableProjectState = {
  source: { name: 'trip.mp4', size: 123, lastModified: 456 },
  savedAt: 789,
  startTime: 1,
  endTime: 5,
  presetId: 'youtube-short',
  cropPosition: 50,
  cropPositionY: 50,
  quality: 'high',
  frameRate: 30,
  muted: false,
  gainDb: 0,
  normalize: false,
  fadeIn: 0,
  fadeOut: 0,
  captionStyle: { size: 'medium', position: 'bottom', backdrop: true },
  burnCaptions: false,
  clipQueue: [],
};

describe('hydrateEditorPersistence', () => {
  it('parses saved export preferences and project recovery together', () => {
    expect(hydrateEditorPersistence(
      JSON.stringify({ presetId: 'tiktok', cropPosition: 40, cropPositionY: 60, quality: 'maximum' }),
      serializeProjectRecovery(recovery),
    )).toEqual({
      preferences: {
        presetId: 'tiktok',
        cropPosition: 40,
        cropPositionY: 60,
        quality: 'maximum',
      },
      pendingRecovery: recovery,
    });
  });

  it('falls back safely when persisted values are malformed', () => {
    expect(hydrateEditorPersistence('{bad', '{bad')).toEqual({
      preferences: {},
      pendingRecovery: null,
    });
  });

  it('supports missing persisted values', () => {
    expect(hydrateEditorPersistence(null, null)).toEqual({
      preferences: {},
      pendingRecovery: null,
    });
  });
});
