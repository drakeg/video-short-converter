import { parseBenchmarkEvidence, validateBenchmarkEvidenceFiles } from '@/components/video-editor/benchmarkEvidenceReview';
import { buildTranscriptionBenchmarkEvidence } from '@/components/video-editor/transcriptionBenchmarkEvidence';

const valid = () => buildTranscriptionBenchmarkEvidence(
  new File(['video'], 'sample.mp4', { type: 'video/mp4' }),
  {
    text: 'Hello',
    cues: [{ start: 0, end: 1, text: 'Hello' }],
    benchmark: { sourceDurationSeconds: 2, coldLoadMs: 100, transcriptionMs: 500,
      executionProvider: 'wasm', cueCount: 1, modelId: 'model' },
  },
  { enabled: true, webGpuAvailable: false, executionPreference: 'wasm', reason: 'test' },
  'test browser',
);

describe('imported benchmark review', () => {
  it('reads exported evidence without changing its measurements', () => {
    const evidence = valid();
    const review = parseBenchmarkEvidence(JSON.stringify(evidence));
    expect(review.evidence).toEqual(evidence);
    expect(review.warnings).toEqual([]);
  });

  it('retains suspect measurements but flags their quality', () => {
    const evidence = valid();
    evidence.benchmark.cueCount = 10;
    const review = parseBenchmarkEvidence(JSON.stringify(evidence));
    expect(review.warnings).toContain('Reported cue count differs from the exported cue list.');
    expect(review.evidence.benchmark.cueCount).toBe(10);
  });

  it.each(['not json', '{}', JSON.stringify({ ...valid(), schemaVersion: 999 })])(
    'rejects malformed or unsupported evidence',
    (content) => { expect(() => parseBenchmarkEvidence(content)).toThrow(); },
  );

  it('rejects invalid nested data before quality assessment', () => {
    const evidence = valid();
    expect(() => parseBenchmarkEvidence(JSON.stringify({ ...evidence, cues: [{}] }))).toThrow('missing required fields');
    expect(() => parseBenchmarkEvidence(JSON.stringify({ ...evidence, benchmark: null }))).toThrow('missing required fields');
  });

  it('limits JSON text size', () => {
    expect(() => parseBenchmarkEvidence(' '.repeat(2_000_001))).toThrow('2 MB');
  });
  it('rejects selections larger than the documented ten-file limit', () => {
    const selected = Array.from({ length: 11 }, (_, index) => ({ name: `run-${index}.json`, size: 20 }));
    expect(validateBenchmarkEvidenceFiles(selected)).toMatch(/11 were selected/);
    expect(validateBenchmarkEvidenceFiles(selected.slice(0, 10))).toBeNull();
  });

  it('rejects oversized and empty benchmark files before reading', () => {
    expect(validateBenchmarkEvidenceFiles([{ name: 'large.json', size: 2_000_001 }])).toMatch(/2 MB/);
    expect(validateBenchmarkEvidenceFiles([{ name: 'empty.json', size: 0 }])).toMatch(/empty/);
    expect(validateBenchmarkEvidenceFiles([{ name: 'maximum.json', size: 2_000_000 }])).toBeNull();
  });

});
