import {
  clearEditorRecovery,
  persistEditorRecovery,
  persistExportPreferences,
  readEditorPersistence,
} from '@/components/video-editor/editorPersistenceWrites';
import { EXPORT_PREFERENCES_KEY } from '@/components/video-editor/exportPreferences';
import { parseProjectRecovery, PROJECT_RECOVERY_KEY } from '@/components/video-editor/projectRecovery';
import type { ClipExportSettings } from '@/components/video-editor/clipQueue';

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

describe('editor persistence writes', () => {
  it('reads preferences and recovery through the established storage keys', () => {
    const storage = {
      getItem: jest.fn((key: string) => {
        if (key === EXPORT_PREFERENCES_KEY) {
          return JSON.stringify({ presetId: 'square', cropPosition: 41, cropPositionY: 52, quality: 'high' });
        }
        if (key === PROJECT_RECOVERY_KEY) return null;
        return null;
      }),
    };

    const hydrated = readEditorPersistence(storage);

    expect(storage.getItem).toHaveBeenNthCalledWith(1, EXPORT_PREFERENCES_KEY);
    expect(storage.getItem).toHaveBeenNthCalledWith(2, PROJECT_RECOVERY_KEY);
    expect(hydrated.preferences).toEqual({
      presetId: 'square',
      cropPosition: 41,
      cropPositionY: 52,
      quality: 'high',
    });
    expect(hydrated.pendingRecovery).toBeNull();
  });

  it('persists export preferences under the established storage key', () => {
    const storage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
    persistExportPreferences(storage, { presetId: 'square', cropPosition: 42, cropPositionY: 50, quality: 'high' });
    expect(storage.setItem).toHaveBeenCalledWith(
      EXPORT_PREFERENCES_KEY,
      expect.stringContaining('"presetId":"square"'),
    );
  });

  it('persists a recoverable project snapshot without retaining live queue references', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: jest.fn(),
      setItem: jest.fn((key: string, value: string) => values.set(key, value)),
      removeItem: jest.fn(),
    };
    const file = new File(['video'], 'source.mov', { type: 'video/quicktime', lastModified: 123 });
    const queue = [{ id: 'one', name: 'clip-one', start: 4, end: 14, settings }];

    persistEditorRecovery(storage, file, 4, 14, settings, queue);
    queue[0].name = 'changed-after-save';

    const recovery = parseProjectRecovery(values.get(PROJECT_RECOVERY_KEY) ?? null);
    expect(recovery?.source).toMatchObject({ name: 'source.mov', size: 5, lastModified: 123 });
    expect(recovery?.clipQueue[0].name).toBe('clip-one');
  });

  it('clears recovery through the established storage key', () => {
    const storage = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() };
    clearEditorRecovery(storage);
    expect(storage.removeItem).toHaveBeenCalledWith(PROJECT_RECOVERY_KEY);
  });
});
