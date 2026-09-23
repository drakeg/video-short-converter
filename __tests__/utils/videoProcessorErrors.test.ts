import { describeVideoProcessingFailure } from '@/utils/videoProcessor';

describe('describeVideoProcessingFailure', () => {
  it('preserves string rejection details', () => {
    expect(describeVideoProcessingFailure('exit code 1', [])).toBe('exit code 1');
  });

  it('includes recent FFmpeg diagnostics with an Error message', () => {
    expect(describeVideoProcessingFailure(
      new Error('Encoding failed'),
      ['[fferr] first detail', '[fferr] codec not supported'],
    )).toBe('Encoding failed — FFmpeg: [fferr] first detail | [fferr] codec not supported');
  });

  it('falls back to diagnostics when the thrown value has no detail', () => {
    expect(describeVideoProcessingFailure(null, ['[fferr] invalid argument']))
      .toBe('FFmpeg: [fferr] invalid argument');
  });

  it('uses a stable fallback when no detail is available', () => {
    expect(describeVideoProcessingFailure(undefined, [])).toBe('Unknown video processor error.');
  });
});
