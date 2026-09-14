import { fireEvent, render, screen } from '@testing-library/react';
import ExportHistory from '@/components/video-editor/ExportHistory';
import { EXPORT_HISTORY_KEY } from '@/components/video-editor/exportHistory';
import { parseProjectRecovery, PROJECT_RECOVERY_KEY } from '@/components/video-editor/projectRecovery';

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

  it('restores retained manifest clips through the provided queue callback', () => {
    const onRestoreQueue = jest.fn();
    window.localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify([{
      id: 'one', exportedAt: '2026-09-13T20:00:00.000Z', clipCount: 1, successCount: 1, failureCount: 0, successfulFiles: ['intro.mp4'], failedClips: [],
      manifest: { schemaVersion: 1, exportedAt: '2026-09-13T20:00:00.000Z', clips: [{ id: 'clip-one', name: 'intro', start: 4, end: 34, duration: 30, status: 'exported', outputFile: 'intro.mp4', settingsCaptured: false }] },
    }]));

    render(<ExportHistory onRestoreQueue={onRestoreQueue} />);
    fireEvent.click(screen.getByRole('button', { name: 'Restore queue' }));
    expect(onRestoreQueue).toHaveBeenCalledTimes(1);
    expect(onRestoreQueue.mock.calls[0][0]).toEqual([expect.objectContaining({ name: 'intro', start: 4, end: 34 })]);
    expect(screen.getByRole('status')).toHaveTextContent('Restored 1 clip to the current queue.');
  });

  it('creates a source-specific recovery record from a schema v2 history manifest', () => {
    window.localStorage.setItem(EXPORT_HISTORY_KEY, JSON.stringify([{
      id: 'one', exportedAt: '2026-09-13T20:00:00.000Z', clipCount: 1, successCount: 1, failureCount: 0, successfulFiles: ['intro.mp4'], failedClips: [],
      manifest: {
        schemaVersion: 2,
        exportedAt: '2026-09-13T20:00:00.000Z',
        source: { name: 'source.mov', size: 1234, lastModified: 1720000000000 },
        clips: [{ id: 'clip-one', name: 'intro', start: 4, end: 34, duration: 30, status: 'exported', outputFile: 'intro.mp4', settingsCaptured: false }],
      },
    }]));

    render(<ExportHistory />);
    expect(screen.getByText('Source: source.mov')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Restore queue' }));

    const recovery = parseProjectRecovery(window.localStorage.getItem(PROJECT_RECOVERY_KEY));
    expect(recovery?.source).toEqual({ name: 'source.mov', size: 1234, lastModified: 1720000000000 });
    expect(recovery?.clipQueue[0]).toMatchObject({ name: 'intro', start: 4, end: 34 });
    expect(screen.getByRole('status')).toHaveTextContent('Re-select source.mov');
  });
});
