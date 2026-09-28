import type { LocalTranscriptionCapability } from './localTranscriptionPrototype';
import { importTransformersRuntime, loadWhisperPipeline } from './localTranscriptionRuntime';
import { runLocalWhisperPrototype, type LocalWhisperPrototypeResult } from './localWhisperPrototype';
import { extractTranscriptionAudio } from '@/utils/videoProcessor';
import { TRANSCRIPTION_SAMPLE_RATE } from '@/utils/transcriptionAudio';

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
  capability: LocalTranscriptionCapability,
  dependencies: LocalTranscriptionHarnessDependencies = defaultDependencies,
): Promise<LocalWhisperPrototypeResult> {
  if (!capability.enabled || capability.executionPreference === 'disabled') {
    throw new Error('Local transcription prototype is disabled.');
  }
  const audio = await dependencies.extractAudio(file);
  if (!audio.length) throw new Error('Local transcription requires non-empty extracted audio.');
  const sourceDurationSeconds = audio.length / TRANSCRIPTION_SAMPLE_RATE;
  const pipeline = await loadWhisperPipeline(true, dependencies.importRuntime);
  return runLocalWhisperPrototype(audio, sourceDurationSeconds, capability, pipeline);
}
