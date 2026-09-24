import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportErrorDetails, { isExportFailureMessage } from '@/components/video-editor/ExportErrorDetails';

jest.mock('@/components/video-editor/browserClipboard', () => ({
  copyTextToClipboard: jest.fn().mockResolvedValue(true),
}));

describe('ExportErrorDetails', () => {
  it.each([
    'Video processing failed: codec error',
    'Batch export failed. Please try again.',
    'Unable to initialize the video processor. Please reload and try again.',
    'Unable to load the local video processor assets. Reload the page and try again.',
    'The video processor produced an empty file.',
    'Burned-in captions are not supported by this browser/runtime.',
  ])('recognizes export failure message %s', (message) => {
    expect(isExportFailureMessage(message)).toBe(true);
  });

  it('does not classify playback errors as export failures', () => {
    expect(isExportFailureMessage('Unable to play this video in the browser.')).toBe(false);
  });

  it('renders diagnostic text and supports copying it', async () => {
    render(<ExportErrorDetails message="Video processing failed: codec error" />);
    expect(screen.getByText('Export failed')).toBeInTheDocument();
    expect(screen.getByTestId('export-error-details')).toHaveTextContent('codec error');
    fireEvent.click(screen.getByRole('button', { name: 'Copy details' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copied export details.'));
  });
});
