import {
  buildVideoProcessorAssetUrls,
  verifyVideoProcessorAssets,
} from '@/utils/videoProcessorAssets';

describe('video processor asset preflight', () => {
  it('builds same-origin URLs for all required FFmpeg assets', () => {
    expect(buildVideoProcessorAssetUrls('http://localhost:8007')).toEqual({
      'ffmpeg-core.js': 'http://localhost:8007/ffmpeg/ffmpeg-core.js',
      'ffmpeg-core.wasm': 'http://localhost:8007/ffmpeg/ffmpeg-core.wasm',
    });
  });

  it('checks each required asset with HEAD and returns the resolved URLs', async () => {
    const fetcher = jest.fn().mockResolvedValue({ ok: true, status: 200, statusText: 'OK' });
    const urls = await verifyVideoProcessorAssets('https://example.test', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      'https://example.test/ffmpeg/ffmpeg-core.js',
      { method: 'HEAD', cache: 'no-store' },
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      'https://example.test/ffmpeg/ffmpeg-core.wasm',
      { method: 'HEAD', cache: 'no-store' },
    );
    expect(urls['ffmpeg-core.js']).toBe('https://example.test/ffmpeg/ffmpeg-core.js');
  });

  it('reports the exact missing asset and HTTP status', async () => {
    const fetcher = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, statusText: 'OK' })
      .mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });

    await expect(verifyVideoProcessorAssets('https://example.test', fetcher))
      .rejects.toThrow(
        'Unable to load the local video processor asset ffmpeg-core.wasm: HTTP 404 Not Found',
      );
  });

  it('reports network failures with the exact asset name', async () => {
    const fetcher = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

    await expect(verifyVideoProcessorAssets('https://example.test', fetcher))
      .rejects.toThrow(
        'Unable to load the local video processor asset ffmpeg-core.js: Failed to fetch',
      );
  });
});
