import {
  createReplacementObjectUrl,
  downloadBrowserFile,
  revokeObjectUrl,
} from '@/components/video-editor/browserFileLifecycle';

describe('browser file lifecycle', () => {
  const createObjectURL = jest.fn();
  const revokeObjectURL = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    createObjectURL.mockReset().mockReturnValue('blob:new');
    revokeObjectURL.mockReset();
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('revokes a previous URL before creating its replacement', () => {
    const file = new File(['video'], 'source.mp4', { type: 'video/mp4' });
    expect(createReplacementObjectUrl('blob:old', file)).toBe('blob:new');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:old');
    expect(createObjectURL).toHaveBeenCalledWith(file);
  });

  it('creates a URL without revoking when there is no previous URL', () => {
    const file = new File(['video'], 'source.mp4', { type: 'video/mp4' });
    expect(createReplacementObjectUrl(null, file)).toBe('blob:new');
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it('revokes only non-null URLs', () => {
    revokeObjectUrl(null);
    revokeObjectUrl('blob:cleanup');
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:cleanup');
  });

  it('downloads with the file name and revokes the temporary URL after dispatch', () => {
    const file = new File(['video'], 'short.mp4', { type: 'video/mp4' });
    const anchor = document.createElement('a');
    const click = jest.spyOn(anchor, 'click').mockImplementation(() => undefined);
    const createElement = jest.spyOn(document, 'createElement').mockReturnValue(anchor);
    const append = jest.spyOn(document.body, 'appendChild');
    const remove = jest.spyOn(document.body, 'removeChild');

    downloadBrowserFile(file);

    expect(anchor.href).toContain('blob:new');
    expect(anchor.download).toBe('short.mp4');
    expect(append).toHaveBeenCalledWith(anchor);
    expect(click).toHaveBeenCalled();
    expect(remove).toHaveBeenCalledWith(anchor);
    expect(revokeObjectURL).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:new');

    createElement.mockRestore();
    append.mockRestore();
    remove.mockRestore();
    click.mockRestore();
  });
});
