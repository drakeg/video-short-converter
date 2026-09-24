import type { TranscriptCue } from './transcript';
import type { LocalTranscriptionCapability, TranscriptionBenchmark } from './localTranscriptionPrototype';

export const LOCAL_TRANSCRIPTION_MODEL_ID = 'onnx-community/whisper-tiny.en';

export interface WhisperChunk {
  text?: string;
  timestamp?: [number | null, number | null];
}

export interface WhisperOutput {
  text?: string;
  chunks?: WhisperChunk[];
}

export interface WhisperTranscriber {
  (audio: Float32Array, options: { return_timestamps: true }): Promise<WhisperOutput>;
}

export interface WhisperPipelineLoader {
  (
    task: 'automatic-speech-recognition',
    modelId: string,
    options: { device: 'webgpu' | 'wasm' },
  ): Promise<WhisperTranscriber>;
}

export interface LocalWhisperPrototypeResult {
  cues: TranscriptCue[];
  text: string;
  benchmark: TranscriptionBenchmark;
}

export function whisperChunksToTranscriptCues(chunks: WhisperChunk[] | undefined): TranscriptCue[] {
  if (!chunks) return [];
  return chunks.flatMap((chunk) => {
    const [start, end] = chunk.timestamp ?? [null, null];
    const text = chunk.text?.trim() ?? '';
    if (start === null || end === null || !Number.isFinite(start) || !Number.isFinite(end) || end <= start || !text) return [];
    return [{ start, end, text }];
  });
}

export async function runLocalWhisperPrototype(
  audio: Float32Array,
  sourceDurationSeconds: number,
  capability: LocalTranscriptionCapability,
  loadPipeline: WhisperPipelineLoader,
  now: () => number = () => performance.now(),
): Promise<LocalWhisperPrototypeResult> {
  if (!capability.enabled || capability.executionPreference === 'disabled') {
    throw new Error('Local transcription prototype is disabled.');
  }
  if (!audio.length) throw new Error('Local transcription requires decoded audio samples.');

  const executionProvider = capability.executionPreference;
  const loadStarted = now();
  const transcriber = await loadPipeline('automatic-speech-recognition', LOCAL_TRANSCRIPTION_MODEL_ID, {
    device: executionProvider,
  });
  const coldLoadMs = Math.max(0, now() - loadStarted);

  const transcriptionStarted = now();
  const output = await transcriber(audio, { return_timestamps: true });
  const transcriptionMs = Math.max(0, now() - transcriptionStarted);
  const cues = whisperChunksToTranscriptCues(output.chunks);

  return {
    cues,
    text: output.text?.trim() ?? '',
    benchmark: {
      sourceDurationSeconds,
      coldLoadMs,
      transcriptionMs,
      executionProvider,
      cueCount: cues.length,
      modelId: LOCAL_TRANSCRIPTION_MODEL_ID,
    },
  };
}
