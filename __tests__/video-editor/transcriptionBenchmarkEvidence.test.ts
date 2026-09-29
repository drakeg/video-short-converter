import { buildTranscriptionBenchmarkEvidence, TRANSCRIPTION_BENCHMARK_EVIDENCE_VERSION } from '@/components/video-editor/transcriptionBenchmarkEvidence';

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
});
