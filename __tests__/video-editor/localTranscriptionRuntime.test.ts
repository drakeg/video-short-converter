import { loadWhisperPipeline } from '@/components/video-editor/localTranscriptionRuntime';

describe('local transcription runtime boundary', () => {
  it('does not import the runtime while the prototype is disabled', async () => {
    const importer = jest.fn();
    await expect(loadWhisperPipeline(false, importer)).rejects.toThrow('Local transcription prototype is disabled.');
    expect(importer).not.toHaveBeenCalled();
  });

  it('adapts the runtime pipeline to the Whisper prototype contract', async () => {
    const transcriber = jest.fn().mockResolvedValue({
      text: ' hello world ',
      chunks: [{ text: ' hello ', timestamp: [0, 1.5] }],
    });
    const pipeline = jest.fn().mockResolvedValue(transcriber);
    const loader = await loadWhisperPipeline(true, async () => ({ pipeline }));

    const whisper = await loader('automatic-speech-recognition', 'test-model', { device: 'webgpu' });
    await expect(whisper(new Float32Array([0.1]), { return_timestamps: true })).resolves.toEqual({
      text: ' hello world ',
      chunks: [{ text: ' hello ', timestamp: [0, 1.5] }],
    });
    expect(pipeline).toHaveBeenCalledWith('automatic-speech-recognition', 'test-model', { device: 'webgpu' });
    expect(transcriber).toHaveBeenCalledWith(expect.any(Float32Array), { return_timestamps: true });
  });

  it('normalizes malformed optional output fields instead of leaking runtime-specific shapes', async () => {
    const pipeline = jest.fn().mockResolvedValue(jest.fn().mockResolvedValue({ text: 42, chunks: [{ text: 7, timestamp: ['bad'] }] }));
    const loader = await loadWhisperPipeline(true, async () => ({ pipeline }));
    const whisper = await loader('automatic-speech-recognition', 'test-model', { device: 'wasm' });
    await expect(whisper(new Float32Array([0.1]), { return_timestamps: true })).resolves.toEqual({
      text: undefined,
      chunks: [{ text: undefined, timestamp: undefined }],
    });
  });

  it('reports an actionable error for an invalid runtime module', async () => {
    await expect(loadWhisperPipeline(true, async () => ({ pipeline: undefined } as never))).rejects.toThrow(
      'Transformers.js automatic-speech-recognition pipeline is unavailable.',
    );
  });

  it('reports an actionable error when the runtime does not return a callable pipeline', async () => {
    const loader = await loadWhisperPipeline(true, async () => ({ pipeline: jest.fn().mockResolvedValue({}) }));
    await expect(loader('automatic-speech-recognition', 'test-model', { device: 'wasm' })).rejects.toThrow(
      'Transformers.js did not return a callable transcription pipeline.',
    );
  });
});
