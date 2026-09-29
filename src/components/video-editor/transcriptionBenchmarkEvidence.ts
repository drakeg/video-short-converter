import { calculateRealtimeFactor, type LocalTranscriptionCapability } from './localTranscriptionPrototype';
import type { LocalWhisperPrototypeResult } from './localWhisperPrototype';

export const TRANSCRIPTION_BENCHMARK_EVIDENCE_VERSION = 1;

export interface TranscriptionBenchmarkEvidence {
  schemaVersion: typeof TRANSCRIPTION_BENCHMARK_EVIDENCE_VERSION;
  capturedAt: string;
  source: { name: string; sizeBytes: number; lastModified: number; type: string };
  runtime: { userAgent: string; webGpuAvailable: boolean };
  benchmark: LocalWhisperPrototypeResult['benchmark'];
  realtimeFactor: number | null;
  transcriptText: string;
  cues: LocalWhisperPrototypeResult['cues'];
}

export function buildTranscriptionBenchmarkEvidence(
  file: File,
  result: LocalWhisperPrototypeResult,
  capability: LocalTranscriptionCapability,
  userAgent: string,
  capturedAt = new Date().toISOString(),
): TranscriptionBenchmarkEvidence {
  return {
    schemaVersion: TRANSCRIPTION_BENCHMARK_EVIDENCE_VERSION,
    capturedAt,
    source: { name: file.name, sizeBytes: file.size, lastModified: file.lastModified, type: file.type },
    runtime: { userAgent, webGpuAvailable: capability.webGpuAvailable },
    benchmark: { ...result.benchmark },
    realtimeFactor: calculateRealtimeFactor(result.benchmark),
    transcriptText: result.text,
    cues: result.cues.map((cue) => ({ ...cue })),
  };
}
