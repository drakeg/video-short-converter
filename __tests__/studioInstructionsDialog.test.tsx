import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => () => null,
}));
jest.mock('@/components/RequireAuth', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('studio instructions keyboard access', () => {
  it('focuses its close button and restores focus after Escape', async () => {
    render(<Home />);
    const trigger = screen.getByRole('button', { name: /how it works/i });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'How to Create a Short Clip' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close instructions' })).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('keeps keyboard focus inside the dialog when tabbing past its last control', () => {
    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: /how it works/i }));
    const close = screen.getByRole('button', { name: 'Close instructions' });
    const done = screen.getByRole('button', { name: 'Got it' });
    done.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(close).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(done).toHaveFocus();
  });

  it('does not close when interacting inside, but closes on the backdrop', async () => {
    render(<Home />);
    const trigger = screen.getByRole('button', { name: /how it works/i });
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog');
    fireEvent.mouseDown(dialog);
    expect(dialog).toBeInTheDocument();
    fireEvent.mouseDown(dialog.parentElement as HTMLElement);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
