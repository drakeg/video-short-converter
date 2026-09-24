import {
  LOCAL_TRANSCRIPTION_MODEL_ID,
  runLocalWhisperPrototype,
  whisperChunksToTranscriptCues,
} from '@/components/video-editor/localWhisperPrototype';

describe('local Whisper prototype adapter', () => {
  it('normalizes valid timestamp chunks to the existing transcript cue contract', () => {
    expect(whisperChunksToTranscriptCues([
      { text: ' Hello ', timestamp: [0, 2.5] },
      { text: '', timestamp: [2.5, 3] },
      { text: 'invalid', timestamp: [4, 4] },
      { text: 'World', timestamp: [2.5, 5] },
    ])).toEqual([
      { start: 0, end: 2.5, text: 'Hello' },
      { start: 2.5, end: 5, text: 'World' },
    ]);
  });

  it('rejects execution when the developer prototype is disabled', async () => {
    await expect(runLocalWhisperPrototype(
      new Float32Array([0.1]),
      1,
      { enabled: false, webGpuAvailable: false, executionPreference: 'disabled', reason: 'off' },
      jest.fn(),
    )).rejects.toThrow('Local transcription prototype is disabled.');
  });

  it('loads the pinned tiny English model and records benchmark evidence', async () => {
    const transcriber = jest.fn().mockResolvedValue({
      text: 'Hello world',
      chunks: [{ text: ' Hello world ', timestamp: [0, 2] }],
    });
    const loadPipeline = jest.fn().mockResolvedValue(transcriber);
    const times = [100, 350, 400, 900];
    const now = () => times.shift() ?? 900;

    const result = await runLocalWhisperPrototype(
      new Float32Array([0.1, 0.2]),
      2,
      { enabled: true, webGpuAvailable: true, executionPreference: 'webgpu', reason: 'available' },
      loadPipeline,
      now,
    );

    expect(loadPipeline).toHaveBeenCalledWith('automatic-speech-recognition', LOCAL_TRANSCRIPTION_MODEL_ID, {
      device: 'webgpu',
    });
    expect(transcriber).toHaveBeenCalledWith(expect.any(Float32Array), { return_timestamps: true });
    expect(result.cues).toEqual([{ start: 0, end: 2, text: 'Hello world' }]);
    expect(result.benchmark).toEqual({
      sourceDurationSeconds: 2,
      coldLoadMs: 250,
      transcriptionMs: 500,
      executionProvider: 'webgpu',
      cueCount: 1,
      modelId: LOCAL_TRANSCRIPTION_MODEL_ID,
    });
  });
});
