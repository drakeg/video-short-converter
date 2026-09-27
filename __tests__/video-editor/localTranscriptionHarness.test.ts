import { runLocalTranscriptionHarness } from '@/components/video-editor/localTranscriptionHarness';
import type { LocalTranscriptionCapability } from '@/components/video-editor/localTranscriptionPrototype';

const webGpu: LocalTranscriptionCapability = {
  enabled: true,
  webGpuAvailable: true,
  executionPreference: 'webgpu',
  reason: 'test',
};

describe('local transcription developer harness', () => {
  it('connects local audio extraction to the gated runtime and returns benchmark evidence', async () => {
    const extractAudio = jest.fn().mockResolvedValue(new Float32Array([0.1, -0.1]));
    const transcriber = jest.fn().mockResolvedValue({
      text: 'hello',
      chunks: [{ text: ' hello ', timestamp: [0, 1] }],
    });
    const pipeline = jest.fn().mockResolvedValue(transcriber);
    const importRuntime = jest.fn().mockResolvedValue({ pipeline });

    const result = await runLocalTranscriptionHarness(
      new File(['video'], 'source.mp4', { type: 'video/mp4' }),
      1,
      webGpu,
      { extractAudio, importRuntime },
    );

    expect(extractAudio).toHaveBeenCalledTimes(1);
    expect(importRuntime).toHaveBeenCalledTimes(1);
    expect(pipeline).toHaveBeenCalledWith(
      'automatic-speech-recognition',
      'onnx-community/whisper-tiny.en',
      { device: 'webgpu' },
    );
    expect(result.text).toBe('hello');
    expect(result.cues).toEqual([{ start: 0, end: 1, text: 'hello' }]);
    expect(result.benchmark).toEqual(expect.objectContaining({
      sourceDurationSeconds: 1,
      executionProvider: 'webgpu',
      cueCount: 1,
      modelId: 'onnx-community/whisper-tiny.en',
    }));
  });

  it('does no heavy work while disabled', async () => {
    const extractAudio = jest.fn();
    const importRuntime = jest.fn();
    await expect(runLocalTranscriptionHarness(
      new File(['video'], 'source.mp4'),
      1,
      { enabled: false, webGpuAvailable: false, executionPreference: 'disabled', reason: 'disabled' },
      { extractAudio, importRuntime },
    )).rejects.toThrow('Local transcription prototype is disabled.');
    expect(extractAudio).not.toHaveBeenCalled();
    expect(importRuntime).not.toHaveBeenCalled();
  });

  it('rejects invalid duration before extracting audio or loading the runtime', async () => {
    const extractAudio = jest.fn();
    const importRuntime = jest.fn();
    await expect(runLocalTranscriptionHarness(
      new File(['video'], 'source.mp4'),
      0,
      webGpu,
      { extractAudio, importRuntime },
    )).rejects.toThrow('Local transcription requires a valid source duration.');
    expect(extractAudio).not.toHaveBeenCalled();
    expect(importRuntime).not.toHaveBeenCalled();
  });
});
