export const VIDEO_PROCESSOR_ASSET_FILES = [
  'ffmpeg-core.js',
  'ffmpeg-core.wasm',
  'ffmpeg-core.worker.js',
] as const;

export type VideoProcessorAssetFile = typeof VIDEO_PROCESSOR_ASSET_FILES[number];

export function buildVideoProcessorAssetUrls(origin: string): Record<VideoProcessorAssetFile, string> {
  return Object.fromEntries(
    VIDEO_PROCESSOR_ASSET_FILES.map((file) => [file, new URL(`/ffmpeg/${file}`, origin).href]),
  ) as Record<VideoProcessorAssetFile, string>;
}

type AssetFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Pick<Response, 'ok' | 'status' | 'statusText'>>;

export async function verifyVideoProcessorAssets(
  origin: string,
  fetcher: AssetFetch = fetch,
): Promise<Record<VideoProcessorAssetFile, string>> {
  const urls = buildVideoProcessorAssetUrls(origin);

  for (const file of VIDEO_PROCESSOR_ASSET_FILES) {
    let response: Pick<Response, 'ok' | 'status' | 'statusText'>;
    try {
      response = await fetcher(urls[file], { method: 'HEAD', cache: 'no-store' });
    } catch (error) {
      const detail = error instanceof Error && error.message ? `: ${error.message}` : '';
      throw new Error(`Unable to load the local video processor asset ${file}${detail}`);
    }

    if (!response.ok) {
      const statusText = response.statusText ? ` ${response.statusText}` : '';
      throw new Error(
        `Unable to load the local video processor asset ${file}: HTTP ${response.status}${statusText}`,
      );
    }
  }

  return urls;
}
