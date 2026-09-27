import { buildTranscriptionAudioCommand, decodeTranscriptionAudio, TRANSCRIPTION_SAMPLE_RATE } from '@/utils/transcriptionAudio';

describe('local transcription audio contract', () => {
  it('selects the first audio stream and produces mono 16 kHz float32 samples', () => {
    expect(TRANSCRIPTION_SAMPLE_RATE).toBe(16000);
    expect(buildTranscriptionAudioCommand('source.mov', 'audio.f32')).toEqual([
      '-i', 'source.mov', '-map', '0:a:0', '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-y', 'audio.f32',
    ]);
  });

  it('decodes little-endian float samples without assuming aligned source buffers', () => {
    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);
    view.setFloat32(1, 0.5, true);
    view.setFloat32(5, -0.25, true);
    expect(Array.from(decodeTranscriptionAudio(new Uint8Array(buffer, 1, 8)))).toEqual([0.5, -0.25]);
  });

  it('rejects empty, truncated, and non-finite audio', () => {
    expect(() => decodeTranscriptionAudio(new Uint8Array())).toThrow('invalid transcription audio');
    expect(() => decodeTranscriptionAudio(new Uint8Array([0, 1]))).toThrow('invalid transcription audio');
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setFloat32(0, Number.NaN, true);
    expect(() => decodeTranscriptionAudio(new Uint8Array(buffer))).toThrow('invalid samples');
  });
});
