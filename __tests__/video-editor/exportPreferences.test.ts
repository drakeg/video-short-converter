import { parseExportPreferences, serializeExportPreferences } from '@/components/video-editor/exportPreferences';

describe('export preferences', () => {
  it('parses valid saved preferences', () => {
    expect(parseExportPreferences(JSON.stringify({
      presetId: 'tiktok',
      cropPosition: 42,
      cropPositionY: 63,
      quality: 'high',
    }))).toEqual({
      presetId: 'tiktok',
      cropPosition: 42,
      cropPositionY: 63,
      quality: 'high',
    });
  });

  it('clamps crop percentages and ignores malformed fields', () => {
    expect(parseExportPreferences(JSON.stringify({
      presetId: '',
      cropPosition: 150,
      cropPositionY: -20,
      quality: 'ultra',
    }))).toEqual({
      cropPosition: 100,
      cropPositionY: 0,
    });
  });

  it('ignores invalid JSON and non-finite crop values', () => {
    expect(parseExportPreferences('{bad-json')).toEqual({});
    expect(parseExportPreferences(JSON.stringify({
      presetId: 'youtube-short',
      cropPosition: null,
      cropPositionY: '50',
      quality: 'maximum',
    }))).toEqual({
      presetId: 'youtube-short',
      quality: 'maximum',
    });
  });

  it('serializes the current preference snapshot deterministically', () => {
    expect(serializeExportPreferences({
      presetId: 'instagram-reel',
      cropPosition: 50,
      cropPositionY: 25,
      quality: 'maximum',
    })).toBe('{"presetId":"instagram-reel","cropPosition":50,"cropPositionY":25,"quality":"maximum"}');
  });
});
