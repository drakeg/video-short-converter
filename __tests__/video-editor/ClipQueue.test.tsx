import { fireEvent, render, screen } from '@testing-library/react';
import ClipQueue from '@/components/video-editor/ClipQueue';
import type { ClipQueueItem } from '@/components/video-editor/clipQueue';

const baseClip: ClipQueueItem = { id: 'one', name: 'clip-one', start: 0, end: 30 };
const handlers = { onAdd: jest.fn(), onSelect: jest.fn(), onRename: jest.fn(), onRemove: jest.fn(), onExportAll: jest.fn() };

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
});
