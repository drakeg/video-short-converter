import { fireEvent, render, screen } from '@testing-library/react';
import ExportHistory from '@/components/video-editor/ExportHistory';
import { EXPORT_HISTORY_KEY } from '@/components/video-editor/exportHistory';

describe('ExportHistory', () => {
  beforeEach(() => window.localStorage.clear());

  it('shows persisted export metadata and clears it locally', () => {
    window.localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify([{
      id: 'one', exportedAt: '2026-09-13T20:00:00.000Z', clipCount: 2, successCount: 1, failureCount: 1, successfulFiles: ['intro.mp4'], failedClips: [{ name: 'outro', message: 'failed' }],
    }]));

    render(<ExportHistory />);
    expect(screen.getByText('1 of 2 clips exported')).toBeInTheDocument();
    expect(screen.getByText(/intro\.mp4/)).toBeInTheDocument();
    expect(screen.getByText(/Failed: outro/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear history' }));
    expect(screen.queryByLabelText('Recent export history')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(EXPORT_HISTORY_KEY)).toBeNull();
  });
});
