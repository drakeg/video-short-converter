import { buildProcessorInputName } from '@/utils/videoSourceContainer';

export const TRANSCRIPTION_SAMPLE_RATE = 16000;

export function buildTranscriptionAudioCommand(inputName: string, outputName: string): string[] {
  return ['-i', inputName, '-map', '0:a:0', '-vn', '-ac', '1', '-ar', String(TRANSCRIPTION_SAMPLE_RATE), '-f', 'f32le', '-y', outputName];
}

export function decodeTranscriptionAudio(bytes: Uint8Array): Float32Array {
  if (!bytes.length || bytes.byteLength % 4 !== 0) {
    throw new Error('The video processor produced invalid transcription audio.');
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const samples = new Float32Array(bytes.byteLength / 4);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = view.getFloat32(index * 4, true);
    if (!Number.isFinite(sample)) throw new Error('The transcription audio contains invalid samples.');
    samples[index] = sample;
  }
  return samples;
}

export function buildTranscriptionInputName(file: File, suffix: string): string {
  return buildProcessorInputName(file, suffix);
}
