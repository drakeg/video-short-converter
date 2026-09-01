import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import {
  DEFAULT_PRESET,
  buildVideoFilter,
  type VideoExportOptions,
} from '@/components/video-editor/editorConfig';

type FFmpegClient = ReturnType<typeof createFFmpeg>;

let ffmpegInstance: FFmpegClient | null = null;
let initializationPromise: Promise<FFmpegClient> | null = null;

async function getFFmpegClient(): Promise<FFmpegClient> {
  if (typeof window === 'undefined') {
    throw new Error('FFmpeg can only be used in the browser');
  }

  if (ffmpegInstance) return ffmpegInstance;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      const ffmpeg = createFFmpeg({
        log: false,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
      });
      await ffmpeg.load();
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      throw new Error('Failed to load video processor. Please check your internet connection and try again.');
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
  } catch (error) {
    console.warn(`Could not clean up FFmpeg file ${fileName}:`, error);
  }
}

export async function trimVideo(
  file: File,
  startTime: number,
  endTime: number,
  onProgress?: (progress: number) => void,
  options: VideoExportOptions = {
    presetId: DEFAULT_PRESET.id,
    cropPosition: 50,
  },
): Promise<File> {
  if (typeof window === 'undefined') {
    throw new Error('Video trimming is only available in the browser');
  }
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    throw new Error('The trim range is invalid');
  }

  const ffmpeg = await getFFmpegClient();
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const inputName = `input-${suffix}.mp4`;
  const outputName = `output-${suffix}.mp4`;
  const duration = endTime - startTime;

  try {
    const fileData = await fetchFile(file);
    ffmpeg.FS('writeFile', inputName, fileData);

    ffmpeg.setProgress(({ ratio }) => {
      if (!onProgress || !Number.isFinite(ratio)) return;
      onProgress(Math.min(0.95, Math.max(0, ratio * 0.95)));
    });

    onProgress?.(0.02);

    const videoFilter = buildVideoFilter(options);
    const args = [
      '-i', inputName,
      '-ss', startTime.toFixed(3),
      '-t', duration.toFixed(3),
      '-vf', videoFilter,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-y', outputName,
    ];

    await ffmpeg.run(...args);
    onProgress?.(0.97);

    const data = ffmpeg.FS('readFile', outputName);
    if (!data || data.length === 0) {
      throw new Error('FFmpeg produced an empty output file');
    }

    const blob = new Blob([data], { type: 'video/mp4' });
    onProgress?.(1);

    return new File(
      [blob],
      `short-${file.name.replace(/\.[^/.]+$/, '')}-${Date.now()}.mp4`,
      { type: 'video/mp4' },
    );
  } catch (error) {
    console.error('Error during video processing:', error);
    throw new Error(`Video processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    safeUnlink(ffmpeg, inputName);
    safeUnlink(ffmpeg, outputName);
  }
}
