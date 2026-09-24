import { buildOutputStreamMapping } from '@/utils/videoStreamMapping';

describe('buildOutputStreamMapping', () => {
  it('maps the primary source video and optional primary audio by default', () => {
    expect(buildOutputStreamMapping()).toEqual([
      '-map', '0:v:0',
      '-map', '0:a:0?',
    ]);
  });

  it('maps a caption-filter output plus optional primary source audio', () => {
    expect(buildOutputStreamMapping({ captionVideoLabel: '[v3]' })).toEqual([
      '-map', '[v3]',
      '-map', '0:a:0?',
    ]);
  });

  it('omits audio mapping for muted exports', () => {
    expect(buildOutputStreamMapping({ muted: true })).toEqual([
      '-map', '0:v:0',
    ]);
  });

  it('keeps the caption-filter video mapping for muted exports', () => {
    expect(buildOutputStreamMapping({ captionVideoLabel: '[v1]', muted: true })).toEqual([
      '-map', '[v1]',
    ]);
  });
});
