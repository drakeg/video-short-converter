export interface LocalTranscriptionCapability {
  enabled: boolean;
  webGpuAvailable: boolean;
  executionPreference: 'webgpu' | 'wasm' | 'disabled';
  reason: string;
}

export interface NavigatorWithGpu extends Navigator {
  gpu?: unknown;
}

export function resolveLocalTranscriptionCapability(
  enabledValue: string | undefined,
  navigatorValue: NavigatorWithGpu | undefined,
): LocalTranscriptionCapability {
  const enabled = enabledValue === 'true';
  if (!enabled) {
    return {
      enabled: false,
      webGpuAvailable: false,
      executionPreference: 'disabled',
      reason: 'Local transcription prototype is disabled.',
    };
  }

  const webGpuAvailable = Boolean(navigatorValue?.gpu);
  return {
    enabled: true,
    webGpuAvailable,
    executionPreference: webGpuAvailable ? 'webgpu' : 'wasm',
    reason: webGpuAvailable
      ? 'WebGPU is available for the preferred prototype path.'
      : 'WebGPU is unavailable; benchmark the constrained WASM fallback only.',
  };
}

export interface TranscriptionBenchmark {
  sourceDurationSeconds: number;
  coldLoadMs: number;
  transcriptionMs: number;
  executionProvider: 'webgpu' | 'wasm';
  cueCount: number;
  modelId: string;
}

export function calculateRealtimeFactor(result: TranscriptionBenchmark): number | null {
  if (result.sourceDurationSeconds <= 0) return null;
  return result.transcriptionMs / 1000 / result.sourceDurationSeconds;
}
