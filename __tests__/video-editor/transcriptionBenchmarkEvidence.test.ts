import { assessTranscriptionBenchmarkEvidence, buildTranscriptionBenchmarkEvidence, TRANSCRIPTION_BENCHMARK_EVIDENCE_VERSION } from '@/components/video-editor/transcriptionBenchmarkEvidence';

describe('transcription benchmark evidence', () => {
  it('builds versioned reproducible evidence with source and runtime context', () => {
    const file = new File(['abc'], 'sample.mp4', { type: 'video/mp4', lastModified: 123 });
    const evidence = buildTranscriptionBenchmarkEvidence(file, {
      text: 'hello',
      cues: [{ start: 0, end: 1, text: 'hello' }],
      benchmark: {
        sourceDurationSeconds: 2,
        coldLoadMs: 500,
        transcriptionMs: 1000,
        executionProvider: 'webgpu',
        cueCount: 1,
        modelId: 'onnx-community/whisper-tiny.en',
      },
    }, {
      enabled: true,
      webGpuAvailable: true,
      executionPreference: 'webgpu',
      reason: 'test',
    }, 'Test Browser', '2026-09-28T12:00:00.000Z');

    expect(evidence).toEqual({
      schemaVersion: TRANSCRIPTION_BENCHMARK_EVIDENCE_VERSION,
      capturedAt: '2026-09-28T12:00:00.000Z',
      source: { name: 'sample.mp4', sizeBytes: 3, lastModified: 123, type: 'video/mp4' },
      runtime: { userAgent: 'Test Browser', webGpuAvailable: true },
      benchmark: expect.objectContaining({ sourceDurationSeconds: 2, executionProvider: 'webgpu' }),
      realtimeFactor: 0.5,
      transcriptText: 'hello',
      cues: [{ start: 0, end: 1, text: 'hello' }],
    });
  });

  it('copies cue data so later result mutation cannot rewrite exported evidence', () => {
    const cues = [{ start: 0, end: 1, text: 'hello' }];
    const evidence = buildTranscriptionBenchmarkEvidence(
      new File(['x'], 'x.mp4'),
      { text: 'hello', cues, benchmark: { sourceDurationSeconds: 1, coldLoadMs: 1, transcriptionMs: 1, executionProvider: 'wasm', cueCount: 1, modelId: 'model' } },
      { enabled: true, webGpuAvailable: false, executionPreference: 'wasm', reason: 'test' },
      'browser',
    );
    cues[0].text = 'changed';
    expect(evidence.cues[0].text).toBe('hello');
  });
  it('accepts valid benchmark evidence without warnings', () => {
    const evidence = buildTranscriptionBenchmarkEvidence(
      new File(['x'], 'clip.mp4'),
      { text: 'hello', cues: [{ start: 0, end: 1, text: 'hello' }], benchmark: {
        sourceDurationSeconds: 2, coldLoadMs: 100, transcriptionMs: 200,
        executionProvider: 'wasm', cueCount: 1, modelId: 'test-model',
      } },
      { enabled: true, webGpuAvailable: false, executionPreference: 'wasm', reason: 'test' },
      'Test Browser',
    );
    expect(assessTranscriptionBenchmarkEvidence(evidence)).toEqual([]);
  });

  it('flags invalid durations, timing, cue counts and timestamps without discarding evidence', () => {
    const evidence = buildTranscriptionBenchmarkEvidence(
      new File(['x'], 'clip.mp4'),
      { text: 'hello', cues: [{ start: -1, end: 4, text: 'hello' }], benchmark: {
        sourceDurationSeconds: 0, coldLoadMs: -1, transcriptionMs: Number.NaN,
        executionProvider: 'wasm', cueCount: 2, modelId: 'test-model',
      } },
      { enabled: true, webGpuAvailable: false, executionPreference: 'wasm', reason: 'test' },
      'Test Browser',
    );
    const warnings = assessTranscriptionBenchmarkEvidence(evidence);
    expect(warnings).toHaveLength(5);
    expect(warnings.join(' ')).toMatch(/duration|timings|cue count|timestamps|Realtime factor/);
    expect(evidence.cues).toHaveLength(1);
  });

  it('flags timestamps beyond decoded audio including non-finite values', () => {
    const evidence = buildTranscriptionBenchmarkEvidence(
      new File(['x'], 'clip.mp4'),
      { text: 'hello', cues: [{ start: 1, end: Number.POSITIVE_INFINITY, text: 'hello' }], benchmark: {
        sourceDurationSeconds: 2, coldLoadMs: 0, transcriptionMs: 0,
        executionProvider: 'wasm', cueCount: 1, modelId: 'test-model',
      } },
      { enabled: true, webGpuAvailable: false, executionPreference: 'wasm', reason: 'test' },
      'Test Browser',
    );
    expect(assessTranscriptionBenchmarkEvidence(evidence)).toContain('One or more cue timestamps fall outside the decoded audio or are invalid.');
  });

});
