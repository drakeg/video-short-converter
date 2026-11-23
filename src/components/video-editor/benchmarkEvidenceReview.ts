import {
  assessTranscriptionBenchmarkEvidence,
  TRANSCRIPTION_BENCHMARK_EVIDENCE_VERSION,
  type TranscriptionBenchmarkEvidence,
} from './transcriptionBenchmarkEvidence';

export interface ReviewedBenchmark {
  evidence: TranscriptionBenchmarkEvidence;
  warnings: string[];
}

// Imported evidence is untrusted user-selected JSON. Validate its shape before
// passing it to the normal quality checks; never evaluate or upload its contents.
export function parseBenchmarkEvidence(text: string): ReviewedBenchmark {
  if (text.length > 2_000_000) throw new Error('Benchmark evidence exceeds the 2 MB review limit.');
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error('Choose a valid benchmark JSON file.'); }
  if (!isRecord(value) || value.schemaVersion !== TRANSCRIPTION_BENCHMARK_EVIDENCE_VERSION) {
    throw new Error('Unsupported benchmark evidence schema version.');
  }
  const source = value.source;
  const runtime = value.runtime;
  const benchmark = value.benchmark;
  const cues = value.cues;
  if (!isRecord(source) || typeof source.name !== 'string' || !isNonnegativeNumber(source.sizeBytes) ||
      !isNonnegativeNumber(source.lastModified) || typeof source.type !== 'string' ||
      !isRecord(runtime) || typeof runtime.userAgent !== 'string' || typeof runtime.webGpuAvailable !== 'boolean' ||
      !isRecord(benchmark) || !isNumber(benchmark.sourceDurationSeconds) ||
      !isNumber(benchmark.coldLoadMs) || !isNumber(benchmark.transcriptionMs) ||
      !['webgpu', 'wasm'].includes(String(benchmark.executionProvider)) ||
      !isNumber(benchmark.cueCount) || typeof benchmark.modelId !== 'string' ||
      !Array.isArray(cues) || cues.length > 100_000 ||
      !cues.every((cue: unknown) => isRecord(cue) && isNumber(cue.start) &&
        isNumber(cue.end) && typeof cue.text === 'string') ||
      typeof value.capturedAt !== 'string' || !Number.isFinite(Date.parse(value.capturedAt)) ||
      typeof value.transcriptText !== 'string' ||
      !(value.realtimeFactor === null || isNumber(value.realtimeFactor))) {
    throw new Error('Benchmark evidence is missing required fields or has invalid types.');
  }

  const evidence = value as unknown as TranscriptionBenchmarkEvidence;
  return { evidence, warnings: assessTranscriptionBenchmarkEvidence(evidence) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function isNumber(value: unknown): value is number { return typeof value === 'number'; }
function isNonnegativeNumber(value: unknown): boolean {
  return isNumber(value) && Number.isFinite(value) && value >= 0;
}

export const MAX_BENCHMARK_EVIDENCE_FILES = 10;
export const MAX_BENCHMARK_EVIDENCE_BYTES = 2_000_000;

/**
 * Validate the complete selection before reading anything. In particular, never
 * silently ignore files beyond the review limit or partially replace a review.
 */
export function validateBenchmarkEvidenceFiles(
  files: ReadonlyArray<Pick<File, 'name' | 'size'>>,
): string | null {
  if (files.length > MAX_BENCHMARK_EVIDENCE_FILES) {
    return `Choose no more than ${MAX_BENCHMARK_EVIDENCE_FILES} benchmark JSON files; ${files.length} were selected.`;
  }
  for (const file of files) {
    if (file.size > MAX_BENCHMARK_EVIDENCE_BYTES) {
      return `${file.name}: Evidence exceeds the 2 MB review limit.`;
    }
    if (file.size === 0) {
      return `${file.name}: This benchmark evidence file is empty.`;
    }
  }
  return null;
}
