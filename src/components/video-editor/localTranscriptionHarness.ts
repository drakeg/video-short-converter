import type { LocalTranscriptionCapability } from './localTranscriptionPrototype';
import { importTransformersRuntime, loadWhisperPipeline } from './localTranscriptionRuntime';
import { runLocalWhisperPrototype, type LocalWhisperPrototypeResult } from './localWhisperPrototype';
import { extractTranscriptionAudio } from '@/utils/videoProcessor';

export interface LocalTranscriptionHarnessDependencies {
  extractAudio: (file: File) => Promise<Float32Array>;
  importRuntime: typeof importTransformersRuntime;
}

const defaultDependencies: LocalTranscriptionHarnessDependencies = {
  extractAudio: extractTranscriptionAudio,
  importRuntime: importTransformersRuntime,
};

export async function runLocalTranscriptionHarness(
  file: File,
  sourceDurationSeconds: number,
  capability: LocalTranscriptionCapability,
  dependencies: LocalTranscriptionHarnessDependencies = defaultDependencies,
): Promise<LocalWhisperPrototypeResult> {
  if (!capability.enabled || capability.executionPreference === 'disabled') {
    throw new Error('Local transcription prototype is disabled.');
  }
  if (!Number.isFinite(sourceDurationSeconds) || sourceDurationSeconds <= 0) {
    throw new Error('Local transcription requires a valid source duration.');
  }

  const audio = await dependencies.extractAudio(file);
  const pipeline = await loadWhisperPipeline(true, dependencies.importRuntime);
  return runLocalWhisperPrototype(audio, sourceDurationSeconds, capability, pipeline);
}
