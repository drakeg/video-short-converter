import type { WhisperOutput, WhisperPipelineLoader } from './localWhisperPrototype';

export interface TransformersPipelineModule {
  pipeline: (...args: unknown[]) => Promise<unknown>;
}

export type TransformersModuleImporter = () => Promise<TransformersPipelineModule>;

interface TransformersTranscriber {
  (audio: Float32Array, options: { return_timestamps: true }): Promise<unknown>;
}

function normalizeWhisperOutput(output: unknown): WhisperOutput {
  if (!output || typeof output !== 'object') return {};
  const value = output as { text?: unknown; chunks?: unknown };
  const chunks = Array.isArray(value.chunks)
    ? value.chunks.flatMap((chunk) => {
        if (!chunk || typeof chunk !== 'object') return [];
        const candidate = chunk as { text?: unknown; timestamp?: unknown };
        const timestamp = Array.isArray(candidate.timestamp) && candidate.timestamp.length >= 2
          ? [candidate.timestamp[0] ?? null, candidate.timestamp[1] ?? null] as [number | null, number | null]
          : undefined;
        return [{ text: typeof candidate.text === 'string' ? candidate.text : undefined, timestamp }];
      })
    : undefined;
  return { text: typeof value.text === 'string' ? value.text : undefined, chunks };
}

export async function loadWhisperPipeline(
  enabled: boolean,
  importTransformers: TransformersModuleImporter,
): Promise<WhisperPipelineLoader> {
  if (!enabled) throw new Error('Local transcription prototype is disabled.');

  const transformersModule = await importTransformers();
  if (typeof transformersModule.pipeline !== 'function') {
    throw new Error('Transformers.js automatic-speech-recognition pipeline is unavailable.');
  }

  return async (task, modelId, options) => {
    const runtimePipeline = await transformersModule.pipeline(task, modelId, { device: options.device });
    if (typeof runtimePipeline !== 'function') {
      throw new Error('Transformers.js did not return a callable transcription pipeline.');
    }
    const transcriber = runtimePipeline as TransformersTranscriber;
    return async (audio, transcriptionOptions) => normalizeWhisperOutput(
      await transcriber(audio, transcriptionOptions),
    );
  };
}

export function importTransformersRuntime(): Promise<TransformersPipelineModule> {
  return import('@huggingface/transformers') as unknown as Promise<TransformersPipelineModule>;
}
