import {
  calculateRealtimeFactor,
  resolveLocalTranscriptionCapability,
} from '@/components/video-editor/localTranscriptionPrototype';

describe('local transcription prototype', () => {
  it('is disabled unless explicitly developer-enabled', () => {
    expect(resolveLocalTranscriptionCapability(undefined, { gpu: {} } as Navigator)).toMatchObject({
      enabled: false,
      executionPreference: 'disabled',
    });
  });

  it('prefers WebGPU when the developer gate is enabled and GPU is available', () => {
    expect(resolveLocalTranscriptionCapability('true', { gpu: {} } as Navigator)).toMatchObject({
      enabled: true,
      webGpuAvailable: true,
      executionPreference: 'webgpu',
    });
  });

  it('identifies WASM as the benchmark fallback without WebGPU', () => {
    expect(resolveLocalTranscriptionCapability('true', {} as Navigator)).toMatchObject({
      enabled: true,
      webGpuAvailable: false,
      executionPreference: 'wasm',
    });
  });

  it('calculates transcription realtime factor', () => {
    expect(calculateRealtimeFactor({
      sourceDurationSeconds: 60,
      coldLoadMs: 5000,
      transcriptionMs: 30000,
      executionProvider: 'webgpu',
      cueCount: 10,
      modelId: 'tiny.en',
    })).toBe(0.5);
  });

  it('does not calculate realtime factor for an empty source', () => {
    expect(calculateRealtimeFactor({
      sourceDurationSeconds: 0,
      coldLoadMs: 0,
      transcriptionMs: 0,
      executionProvider: 'wasm',
      cueCount: 0,
      modelId: 'tiny.en',
    })).toBeNull();
  });
});
