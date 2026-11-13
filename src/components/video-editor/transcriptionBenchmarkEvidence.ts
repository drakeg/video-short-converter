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

/**
 * Diagnostic-only integrity warnings. Keep raw evidence downloadable for investigation
 * even when a benchmark result should not be used to establish performance thresholds.
 */
export function assessTranscriptionBenchmarkEvidence(evidence: TranscriptionBenchmarkEvidence): string[] {
  const warnings: string[] = [];
  const { benchmark, cues } = evidence;
  const duration = benchmark.sourceDurationSeconds;

  if (!Number.isFinite(duration) || duration <= 0) {
    warnings.push('Decoded audio duration must be a finite positive number.');
  }
  if (!Number.isFinite(benchmark.coldLoadMs) || benchmark.coldLoadMs < 0 ||
      !Number.isFinite(benchmark.transcriptionMs) || benchmark.transcriptionMs < 0) {
    warnings.push('Cold-load and transcription timings must be finite, nonnegative numbers.');
  }
  if (!Number.isInteger(benchmark.cueCount) || benchmark.cueCount !== cues.length) {
    warnings.push('Reported cue count differs from the exported cue list.');
  }
  if (cues.some((cue) => !Number.isFinite(cue.start) || !Number.isFinite(cue.end) ||
    cue.start < 0 || cue.end <= cue.start ||
    (Number.isFinite(duration) && duration > 0 && cue.end > duration + 0.25))) {
    warnings.push('One or more cue timestamps fall outside the decoded audio or are invalid.');
  }
  if (!Number.isFinite(evidence.realtimeFactor ?? NaN) || (evidence.realtimeFactor ?? -1) < 0) {
    warnings.push('Realtime factor is missing or non-finite; do not compare this run.');
  }
  return warnings;
}
