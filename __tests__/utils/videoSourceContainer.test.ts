import {
  buildProcessorInputName,
  resolveVideoSourceExtension,
} from '@/utils/videoSourceContainer';

describe('video source container resolution', () => {
  it.each([
    ['camera.MP4', 'video/mp4', 'mp4'],
    ['camera.MOV', 'video/quicktime', 'mov'],
    ['capture.webm', 'video/webm', 'webm'],
    ['capture.ogg', 'video/ogg', 'ogg'],
  ])('preserves the supported source extension for %s', (name, type, expected) => {
    expect(resolveVideoSourceExtension({ name, type })).toBe(expected);
  });

  it('prefers a supported filename extension over a conflicting MIME type', () => {
    expect(resolveVideoSourceExtension({ name: 'camera.mov', type: 'video/mp4' })).toBe('mov');
  });

  it('uses the MIME type when the filename has no supported extension', () => {
    expect(resolveVideoSourceExtension({ name: 'camera', type: 'video/webm' })).toBe('webm');
  });

  it('falls back to mp4 when neither filename nor MIME type identifies a supported container', () => {
    expect(resolveVideoSourceExtension({ name: 'camera.bin', type: '' })).toBe('mp4');
  });

  it('builds a processor input name with the resolved source extension', () => {
    expect(buildProcessorInputName({ name: 'camera.MOV', type: 'video/quicktime' }, 'abc123'))
      .toBe('input-abc123.mov');
  });
});
