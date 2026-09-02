import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { DEFAULT_PRESET, DEFAULT_QUALITY, QUALITY_CRF, buildVideoFilter, type VideoExportOptions } from '@/components/video-editor/editorConfig';

type FFmpegClient = ReturnType<typeof createFFmpeg>;
let ffmpegInstance: FFmpegClient | null = null;
let initializationPromise: Promise<FFmpegClient> | null = null;

function getCorePath(): string {
  if (typeof window === 'undefined') return '/ffmpeg/ffmpeg-core.js';
  return new URL('/ffmpeg/ffmpeg-core.js', window.location.origin).href;
}

async function getFFmpegClient(): Promise<FFmpegClient> {
  if (typeof window === 'undefined') throw new Error('FFmpeg can only be used in the browser');
  if (ffmpegInstance) return ffmpegInstance;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      const ffmpeg = createFFmpeg({ log: false, corePath: getCorePath() });
      await ffmpeg.load();
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    } catch (error) {
      ffmpegInstance = null;
      throw new Error(error instanceof Error && /network|fetch|load|404/i.test(error.message)
        ? 'Unable to load the local video processor assets. Reload the page and try again.'
        : 'Unable to initialize the video processor. Please reload and try again.');
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

function safeUnlink(ffmpeg: FFmpegClient, fileName: string) {
  try {
    const files = ffmpeg.FS('readdir', '/');
    if (files.includes(fileName)) ffmpeg.FS('unlink', fileName);
  } catch {
    // Cleanup is intentionally best-effort; processing errors are surfaced separately.
  }
}

export async function trimVideo(
  file: File,
  startTime: number,
  endTime: number,
  onProgress?: (progress: number) => void,
  options: VideoExportOptions = { presetId: DEFAULT_PRESET.id, cropPosition: 50, quality: DEFAULT_QUALITY },
): Promise<File> {
  if (typeof window === 'undefined') throw new Error('Video trimming is only available in the browser');
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    throw new Error('Choose a valid start and end time before processing.');
  }

  const ffmpeg = await getFFmpegClient();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const inputName = `input-${suffix}.mp4`;
  const outputName = `output-${suffix}.mp4`;
  const duration = endTime - startTime;

  try {
    onProgress?.(0.01);
    ffmpeg.FS('writeFile', inputName, await fetchFile(file));
    ffmpeg.setProgress(({ ratio }) => {
      if (onProgress && Number.isFinite(ratio)) onProgress(Math.min(0.94, Math.max(0.03, ratio * 0.94)));
    });

    await ffmpeg.run(
      '-i', inputName,
      '-ss', startTime.toFixed(3),
      '-t', duration.toFixed(3),
      '-vf', buildVideoFilter(options),
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', QUALITY_CRF[options.quality ?? DEFAULT_QUALITY],
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y', outputName,
    );

    onProgress?.(0.97);
    const data = ffmpeg.FS('readFile', outputName);
    if (!data?.length) throw new Error('The video processor produced an empty file. Try a different trim range or source video.');

    const outputBytes = new Uint8Array(data.length);
    outputBytes.set(data);
    onProgress?.(1);
    return new File(
      [new Blob([outputBytes.buffer], { type: 'video/mp4' })],
      `short-${file.name.replace(/\.[^/.]+$/, '')}-${Date.now()}.mp4`,
      { type: 'video/mp4' },
    );
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith('Unable') || error.message.startsWith('The video'))) throw error;
    throw new Error(`Video processing failed${error instanceof Error && error.message ? `: ${error.message}` : '. Please try again.'}`);
  } finally {
    safeUnlink(ffmpeg, inputName);
    safeUnlink(ffmpeg, outputName);
    ffmpeg.setProgress(() => undefined);
  }
}
