import { fireEvent, render, screen } from '@testing-library/react';
import ClipQueue from '@/components/video-editor/ClipQueue';
import type { ClipQueueItem } from '@/components/video-editor/clipQueue';

const baseClip: ClipQueueItem = { id: 'one', name: 'clip-one', start: 0, end: 30 };
const handlers = { onAdd: jest.fn(), onSelect: jest.fn(), onRename: jest.fn(), onRemove: jest.fn(), onMove: jest.fn(), onExportAll: jest.fn(), onRetryFailed: jest.fn() };

describe('ClipQueue batch export labels', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps a single queued clip as a direct export', () => {
    render(<ClipQueue clips={[baseClip]} {...handlers} />);
    expect(screen.getByRole('button', { name: 'Export queued clip' })).toBeInTheDocument();
  });

  it('makes multi-clip ZIP export explicit and invokes the batch handler', () => {
    const clips = [baseClip, { ...baseClip, id: 'two', name: 'clip-two', start: 30, end: 60 }];
    render(<ClipQueue clips={clips} {...handlers} />);
    const button = screen.getByRole('button', { name: 'Export all 2 clips as ZIP' });
    fireEvent.click(button);
    expect(handlers.onExportAll).toHaveBeenCalledTimes(1);
  });

  it('highlights failed clips and retries only through the failure action', () => {
    const clips = [baseClip, { ...baseClip, id: 'two', name: 'clip-two', start: 30, end: 60 }];
    render(<ClipQueue clips={clips} failedClipIds={['two']} {...handlers} />);
    expect(screen.getByText('Export failed')).toBeInTheDocument();
    const retry = screen.getByRole('button', { name: 'Retry 1 failed clip' });
    fireEvent.click(retry);
    expect(handlers.onRetryFailed).toHaveBeenCalledTimes(1);
  });

  it('moves clips with accessible controls and disables queue boundaries', () => {
    const clips = [baseClip, { ...baseClip, id: 'two', name: 'clip-two', start: 30, end: 60 }];
    render(<ClipQueue clips={clips} {...handlers} />);

    expect(screen.getByRole('button', { name: 'Move clip-one up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move clip-two down' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Move clip-one down' }));
    expect(handlers.onMove).toHaveBeenCalledWith('one', 'down');

    fireEvent.click(screen.getByRole('button', { name: 'Move clip-two up' }));
    expect(handlers.onMove).toHaveBeenCalledWith('two', 'up');
  });
});
