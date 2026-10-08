import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { buildCaptionOverlayFilter, renderCaptionOverlay } from '@/components/video-editor/captionBurnIn';
import type { CaptionStyle } from '@/components/video-editor/CaptionOverlay';
import { buildClipFileName } from '@/components/video-editor/clipQueue';
import { DEFAULT_PRESET, DEFAULT_QUALITY, QUALITY_CRF, buildVideoFilter, getExportPreset, type VideoExportOptions } from '@/components/video-editor/editorConfig';
import type { TranscriptCue } from '@/components/video-editor/transcript';
import { verifyVideoProcessorAssets } from '@/utils/videoProcessorAssets';
import { buildProcessorInputName } from '@/utils/videoSourceContainer';
import { buildTranscriptionAudioCommand, buildTranscriptionInputName, decodeTranscriptionAudio } from '@/utils/transcriptionAudio';
import { buildOutputStreamMapping } from '@/utils/videoStreamMapping';

type FFmpegClient = FFmpeg;
export interface AudioExportOptions { muted?: boolean; gainDb?: number; normalize?: boolean; fadeIn?: number; fadeOut?: number; }
export interface OutputOptions { clipName?: string; }
export interface CaptionBurnInOptions { enabled?: boolean; cues?: TranscriptCue[]; style?: CaptionStyle; }
let ffmpegInstance: FFmpegClient | null = null;
let initializationPromise: Promise<FFmpegClient> | null = null;
let captionValidationPromise: Promise<void> | null = null;
let captionRuntimeValidated = false;
const ffmpegDiagnostics: string[] = [];
const MAX_FFMPEG_DIAGNOSTICS = 12;

function recordFFmpegDiagnostic(type: string, message: string) {
  const normalized = message.trim();
  if (!normalized) return;
  ffmpegDiagnostics.push(`[${type}] ${normalized}`);
  if (ffmpegDiagnostics.length > MAX_FFMPEG_DIAGNOSTICS) ffmpegDiagnostics.shift();
}

export function describeVideoProcessingFailure(error: unknown, diagnostics: string[] = ffmpegDiagnostics): string {
  const detail = error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : error == null
        ? ''
        : String(error);

  const recent = diagnostics
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-4)
    .join(' | ');

  if (detail && recent && !recent.includes(detail)) return `${detail} — FFmpeg: ${recent}`;
  if (detail) return detail;
  if (recent) return `FFmpeg: ${recent}`;
  return 'Unknown video processor error.';
}

async function getFFmpegClient(): Promise<FFmpegClient> {
  if (typeof window === 'undefined') throw new Error('FFmpeg can only be used in the browser');
  if (ffmpegInstance) return ffmpegInstance;
  if (initializationPromise) return initializationPromise;
  initializationPromise = (async () => {
    try {
      const assets = await verifyVideoProcessorAssets(window.location.origin);
      const ffmpeg = new FFmpeg();
      ffmpeg.on('log', ({ type, message }) => recordFFmpegDiagnostic(type, message));
      await ffmpeg.load({ coreURL: assets['ffmpeg-core.js'], wasmURL: assets['ffmpeg-core.wasm'] });
      ffmpegInstance = ffmpeg;
      return ffmpeg;
    } catch (error) {
      ffmpegInstance = null;
      if (error instanceof Error && error.message.startsWith('Unable to load the local video processor asset ')) throw error;
      throw new Error(`Unable to initialize the video processor: ${describeVideoProcessingFailure(error)}`);
    } finally {
      initializationPromise = null;
    }
  })();
  return initializationPromise;
}
async function safeUnlink(ffmpeg: FFmpegClient, fileName: string): Promise<void> {
  try { await ffmpeg.deleteFile(fileName); } catch { /* best-effort cleanup */ }
}
async function readBytes(ffmpeg: FFmpegClient, fileName: string): Promise<Uint8Array> {
  const data = await ffmpeg.readFile(fileName);
  if (typeof data === 'string') throw new Error('Expected binary output from FFmpeg.');
  return data;
}
async function executeFFmpeg(ffmpeg: FFmpegClient, args: string[]): Promise<void> {
  const exitCode = await ffmpeg.exec(args);
  if (exitCode !== 0) throw new Error(`FFmpeg exited with code ${exitCode}.`);
}
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

export async function validateCaptionBurnInSupport(): Promise<void> {
  if (captionRuntimeValidated) return;
  if (captionValidationPromise) return captionValidationPromise;
  captionValidationPromise = (async () => {
    const ffmpeg = await getFFmpegClient();
    const suffix = `caption-smoke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const overlayName = `${suffix}.png`;
    const outputName = `${suffix}.mp4`;
    try {
      const overlay = await renderCaptionOverlay({ start: 0, end: 0.25, text: 'Caption check' }, { size: 'small', position: 'bottom', backdrop: true }, 320, 180, 0);
      await ffmpeg.writeFile(overlayName, overlay.bytes);
      await executeFFmpeg(ffmpeg, ['-f', 'lavfi', '-i', 'color=c=black:s=320x180:r=10:d=0.25', '-i', overlayName, '-filter_complex', "[0:v]setpts=PTS-STARTPTS[v0];[1:v]format=rgba,setpts=PTS-STARTPTS[cap0];[v0][cap0]overlay=0:0:enable='between(t,0,0.25)'[v1]", '-map', '[v1]', '-an', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-t', '0.25', '-y', outputName]);
      const data = await readBytes(ffmpeg, outputName);
      if (!data?.length) throw new Error('Caption smoke render produced an empty file.');
      captionRuntimeValidated = true;
    } catch (error) {
      throw new Error(`Burned-in captions are not supported by this browser/runtime${error instanceof Error && error.message ? `: ${error.message}` : '.'}`);
    } finally {
      await safeUnlink(ffmpeg, overlayName);
      await safeUnlink(ffmpeg, outputName);
    }
  })().finally(() => { captionValidationPromise = null; });
  return captionValidationPromise;
}

export async function trimVideo(file: File, startTime: number, endTime: number, onProgress?: (progress: number) => void, options: VideoExportOptions = { presetId: DEFAULT_PRESET.id, cropPosition: 50, quality: DEFAULT_QUALITY }, audio: AudioExportOptions = {}, output: OutputOptions = {}, captions: CaptionBurnInOptions = {}): Promise<File> {
  if (typeof window === 'undefined') throw new Error('Video trimming is only available in the browser');
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) throw new Error('Choose a valid start and end time before processing.');
  if (captions.enabled) await validateCaptionBurnInSupport();
  const ffmpeg = await getFFmpegClient(); const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; const inputName = buildProcessorInputName(file, suffix); const outputName = `output-${suffix}.mp4`; const duration = endTime - startTime; const overlayNames: string[] = [];
  const progressHandler = ({ progress }: { progress: number }) => {
    if (onProgress && Number.isFinite(progress)) onProgress(Math.min(.94, Math.max(.03, progress * .94)));
  };
  try {
    ffmpegDiagnostics.length = 0;
    onProgress?.(.01); await ffmpeg.writeFile(inputName, await fetchFile(file));
    const validCues = captions.enabled ? (captions.cues ?? []).filter((cue) => Number.isFinite(cue.start) && Number.isFinite(cue.end) && cue.end > cue.start && cue.text.trim()) : [];
    const preset = getExportPreset(options.presetId);
    if (validCues.length && captions.style) {
      for (let index = 0; index < validCues.length; index += 1) {
        const overlay = await renderCaptionOverlay(validCues[index], captions.style, preset.width, preset.height, index);
        const name = `${suffix}-${overlay.fileName}`;
        await ffmpeg.writeFile(name, overlay.bytes);
        overlayNames.push(name);
      }
    }
    ffmpeg.on('progress', progressHandler);
    const args = overlayNames.length ? ['-ss', startTime.toFixed(3), '-i', inputName] : ['-i', inputName, '-ss', startTime.toFixed(3)];
    overlayNames.forEach((name) => args.push('-i', name));
    args.push('-t', duration.toFixed(3));
    let captionVideoLabel: string | undefined;
    if (overlayNames.length) {
      const plan = buildCaptionOverlayFilter(buildVideoFilter(options), validCues);
      captionVideoLabel = plan.outputLabel;
      args.push('-filter_complex', plan.filter);
    } else args.push('-vf', buildVideoFilter(options));
    args.push(...buildOutputStreamMapping({ captionVideoLabel, muted: audio.muted }));
    args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', QUALITY_CRF[options.quality ?? DEFAULT_QUALITY], '-pix_fmt', 'yuv420p');
    if (options.frameRate && Number.isFinite(options.frameRate) && options.frameRate > 0) args.push('-r', String(options.frameRate));
    if (audio.muted) args.push('-an'); else { const audioFilter = buildAudioFilter(duration, audio); if (audioFilter) args.push('-af', audioFilter); args.push('-c:a', 'aac', '-b:a', '128k'); }
    args.push('-movflags', '+faststart', '-y', outputName); await executeFFmpeg(ffmpeg, args);
    onProgress?.(.97); const data = await readBytes(ffmpeg, outputName); if (!data?.length) throw new Error('The video processor produced an empty file. Try a different trim range or source video.'); const outputBytes = new Uint8Array(data.length); outputBytes.set(data); onProgress?.(1);
    const fileName = output.clipName ? buildClipFileName(file.name, output.clipName) : `short-${file.name.replace(/\.[^/.]+$/, '')}-${Date.now()}.mp4`;
    return new File([new Blob([outputBytes.buffer], { type: 'video/mp4' })], fileName, { type: 'video/mp4' });
  } catch (error) { if (error instanceof Error && (error.message.startsWith('Unable') || error.message.startsWith('The video') || error.message.startsWith('Burned-in'))) throw error; throw new Error(`Video processing failed: ${describeVideoProcessingFailure(error)}`); }
  finally { ffmpeg.off('progress', progressHandler); await Promise.all([inputName, outputName, ...overlayNames].map((name) => safeUnlink(ffmpeg, name))); }
}

/** Extract mono 16 kHz Float32 audio for the developer-only local Whisper prototype. */
export async function extractTranscriptionAudio(file: File): Promise<Float32Array> {
  if (typeof window === 'undefined') throw new Error('Transcription audio extraction is only available in the browser.');
  if (!file.size) throw new Error('Choose a non-empty local video file for transcription.');
  const ffmpeg = await getFFmpegClient();
  const suffix = `transcription-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const inputName = buildTranscriptionInputName(file, suffix);
  const outputName = `audio-${suffix}.f32`;
  try {
    ffmpegDiagnostics.length = 0;
    await ffmpeg.writeFile(inputName, await fetchFile(file));
    await executeFFmpeg(ffmpeg, buildTranscriptionAudioCommand(inputName, outputName));
    return decodeTranscriptionAudio(await readBytes(ffmpeg, outputName));
  } catch (error) {
    throw new Error(`Local transcription audio extraction failed: ${describeVideoProcessingFailure(error)}`);
  } finally {
    await safeUnlink(ffmpeg, inputName);
    await safeUnlink(ffmpeg, outputName);
  }
}
