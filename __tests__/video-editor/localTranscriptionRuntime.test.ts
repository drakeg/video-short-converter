import { loadWhisperPipeline } from '@/components/video-editor/localTranscriptionRuntime';

describe('local transcription runtime boundary', () => {
  it('does not import the runtime while the prototype is disabled', async () => {
    const importer = jest.fn();
    await expect(loadWhisperPipeline(false, importer)).rejects.toThrow(
      'Local transcription prototype is disabled.',
    );
    expect(importer).not.toHaveBeenCalled();
  });

  it('loads the pipeline only after the enabled boundary is crossed', async () => {
    const pipeline = jest.fn();
    const importer = jest.fn().mockResolvedValue({ pipeline });

    await expect(loadWhisperPipeline(true, importer)).resolves.toBe(pipeline);
    expect(importer).toHaveBeenCalledTimes(1);
  });

  it('reports an actionable error for an invalid runtime module', async () => {
    await expect(loadWhisperPipeline(true, async () => ({ pipeline: undefined } as never))).rejects.toThrow(
      'Transformers.js automatic-speech-recognition pipeline is unavailable.',
    );
  });
});
