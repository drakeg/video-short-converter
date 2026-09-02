import { LARGE_FILE_WARNING_BYTES, getRuntimeSupportError, validateVideoFile } from '@/components/video-editor/runtimeSupport';

describe('video runtime support', () => {
  it('rejects empty files', () => {
    expect(validateVideoFile(new File([], 'empty.mp4', { type: 'video/mp4' })).error).toMatch(/empty/i);
  });

  it('rejects unsupported file types', () => {
    expect(validateVideoFile(new File(['x'], 'notes.txt', { type: 'text/plain' })).error).toMatch(/unsupported/i);
  });

  it('accepts supported extensions even when the browser omits the MIME type', () => {
    expect(validateVideoFile(new File(['x'], 'clip.mov')).error).toBeUndefined();
  });

  it('warns before processing very large browser-local files', () => {
    const file = new File(['x'], 'large.mp4', { type: 'video/mp4' });
    Object.defineProperty(file, 'size', { value: LARGE_FILE_WARNING_BYTES, configurable: true });
    expect(validateVideoFile(file).warning).toMatch(/large video/i);
  });

  it('reports no runtime problem when required browser capabilities exist', () => {
    const originalWorker = global.Worker;
    Object.defineProperty(global, 'Worker', { value: class MockWorker {}, configurable: true });
    expect(getRuntimeSupportError()).toBeNull();
    Object.defineProperty(global, 'Worker', { value: originalWorker, configurable: true });
  });
});
