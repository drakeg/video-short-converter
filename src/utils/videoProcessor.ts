import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { DEFAULT_PRESET, DEFAULT_QUALITY, QUALITY_CRF, buildVideoFilter, type VideoExportOptions } from '@/components/video-editor/editorConfig';

type FFmpegClient = ReturnType<typeof createFFmpeg>;
export interface AudioExportOptions { muted?: boolean; gainDb?: number; normalize?: boolean; fadeIn?: number; fadeOut?: number; }
let ffmpegInstance: FFmpegClient | null = null;
let initializationPromise: Promise<FFmpegClient> | null = null;

function getCorePath(): string { if (typeof window === 'undefined') return '/ffmpeg/ffmpeg-core.js'; return new URL('/ffmpeg/ffmpeg-core.js', window.location.origin).href; }
async function getFFmpegClient(): Promise<FFmpegClient> {
  if (typeof window === 'undefined') throw new Error('FFmpeg can only be used in the browser');
  if (ffmpegInstance) return ffmpegInstance;
  if (initializationPromise) return initializationPromise;
  initializationPromise = (async () => { try { const ffmpeg = createFFmpeg({ log: false, corePath: getCorePath() }); await ffmpeg.load(); ffmpegInstance = ffmpeg; return ffmpeg; } catch (error) { ffmpegInstance = null; throw new Error(error instanceof Error && /network|fetch|load|404/i.test(error.message) ? 'Unable to load the local video processor assets. Reload the page and try again.' : 'Unable to initialize the video processor. Please reload and try again.'); } finally { initializationPromise = null; } })();
  return initializationPromise;
}
function safeUnlink(ffmpeg: FFmpegClient, fileName: string) { try { const files = ffmpeg.FS('readdir', '/'); if (files.includes(fileName)) ffmpeg.FS('unlink', fileName); } catch { /* best-effort cleanup */ } }
function buildAudioFilter(duration: number, options: AudioExportOptions): string | null {
  const filters: string[] = [];
  if (options.normalize) filters.push('loudnorm=I=-16:LRA=11:TP=-1.5');
  else if (options.gainDb && options.gainDb !== 0) filters.push(`volume=${options.gainDb}dB`);
  const fadeIn = Math.max(0, Math.min(options.fadeIn ?? 0, duration));
  const fadeOut = Math.max(0, Math.min(options.fadeOut ?? 0, duration));
  if (fadeIn > 0) filters.push(`afade=t=in:st=0:d=${fadeIn.toFixed(2)}`);
  if (fadeOut > 0) filters.push(`afade=t=out:st=${Math.max(0, duration - fadeOut).toFixed(2)}:d=${fadeOut.toFixed(2)}`);
  return filters.length ? filters.join(',') : null;
}

export async function trimVideo(file: File, startTime: number, endTime: number, onProgress?: (progress: number) => void, options: VideoExportOptions = { presetId: DEFAULT_PRESET.id, cropPosition: 50, quality: DEFAULT_QUALITY }, audio: AudioExportOptions = {}): Promise<File> {
  if (typeof window === 'undefined') throw new Error('Video trimming is only available in the browser');
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) throw new Error('Choose a valid start and end time before processing.');
  const ffmpeg = await getFFmpegClient(); const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; const inputName = `input-${suffix}.mp4`; const outputName = `output-${suffix}.mp4`; const duration = endTime - startTime;
  try {
    onProgress?.(.01); ffmpeg.FS('writeFile', inputName, await fetchFile(file)); ffmpeg.setProgress(({ ratio }) => { if (onProgress && Number.isFinite(ratio)) onProgress(Math.min(.94, Math.max(.03, ratio * .94))); });
    const args = ['-i', inputName, '-ss', startTime.toFixed(3), '-t', duration.toFixed(3), '-vf', buildVideoFilter(options), '-c:v', 'libx264', '-preset', 'medium', '-crf', QUALITY_CRF[options.quality ?? DEFAULT_QUALITY], '-pix_fmt', 'yuv420p'];
    if (audio.muted) args.push('-an'); else { const audioFilter = buildAudioFilter(duration, audio); if (audioFilter) args.push('-af', audioFilter); args.push('-c:a', 'aac', '-b:a', '128k'); }
    args.push('-movflags', '+faststart', '-y', outputName); await ffmpeg.run(...args);
    onProgress?.(.97); const data = ffmpeg.FS('readFile', outputName); if (!data?.length) throw new Error('The video processor produced an empty file. Try a different trim range or source video.'); const outputBytes = new Uint8Array(data.length); outputBytes.set(data); onProgress?.(1);
    return new File([new Blob([outputBytes.buffer], { type: 'video/mp4' })], `short-${file.name.replace(/\.[^/.]+$/, '')}-${Date.now()}.mp4`, { type: 'video/mp4' });
  } catch (error) { if (error instanceof Error && (error.message.startsWith('Unable') || error.message.startsWith('The video'))) throw error; throw new Error(`Video processing failed${error instanceof Error && error.message ? `: ${error.message}` : '. Please try again.'}`); }
  finally { safeUnlink(ffmpeg, inputName); safeUnlink(ffmpeg, outputName); ffmpeg.setProgress(() => undefined); }
}
