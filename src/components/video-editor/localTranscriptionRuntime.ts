import type { WhisperPipelineLoader } from './localWhisperPrototype';

export interface TransformersPipelineModule {
  pipeline: WhisperPipelineLoader;
}

export type TransformersModuleImporter = () => Promise<TransformersPipelineModule>;

export async function loadWhisperPipeline(
  enabled: boolean,
  importTransformers: TransformersModuleImporter,
): Promise<WhisperPipelineLoader> {
  if (!enabled) {
    throw new Error('Local transcription prototype is disabled.');
  }

  const module = await importTransformers();
  if (typeof module.pipeline !== 'function') {
    throw new Error('Transformers.js automatic-speech-recognition pipeline is unavailable.');
  }
  return module.pipeline;
}
