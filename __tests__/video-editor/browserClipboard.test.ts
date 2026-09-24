import { copyTextToClipboard } from '@/components/video-editor/browserClipboard';

describe('copyTextToClipboard', () => {
  const originalClipboard = navigator.clipboard;
  const originalExecCommand = document.execCommand;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', { value: originalClipboard, configurable: true });
    Object.defineProperty(document, 'execCommand', { value: originalExecCommand, configurable: true });
    document.querySelectorAll('textarea').forEach((node) => node.remove());
  });

  it('uses the Clipboard API when available', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    expect(await copyTextToClipboard('details')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('details');
  });

  it('falls back to execCommand when Clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    const execCommand = jest.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true });
    expect(await copyTextToClipboard('details')).toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
  });
});
