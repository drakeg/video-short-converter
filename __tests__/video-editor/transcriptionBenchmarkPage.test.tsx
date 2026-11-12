import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TranscriptionBenchmarkPage from '@/app/transcription-benchmark/page';
import { runLocalTranscriptionHarness } from '@/components/video-editor/localTranscriptionHarness';

jest.mock('@/components/video-editor/localTranscriptionHarness', () => ({
  runLocalTranscriptionHarness: jest.fn(),
}));
jest.mock('@/components/video-editor/localTranscriptionPrototype', () => ({
  calculateRealtimeFactor: jest.requireActual('@/components/video-editor/localTranscriptionPrototype').calculateRealtimeFactor,
  resolveLocalTranscriptionCapability: () => ({
    enabled: true, webGpuAvailable: false, executionPreference: 'wasm', reason: 'Enabled for test',
  }),
}));

const runMock = runLocalTranscriptionHarness as jest.MockedFunction<typeof runLocalTranscriptionHarness>;
const result = {
  text: 'hello',
  cues: [{ start: 0, end: 1, text: 'hello' }],
  benchmark: {
    sourceDurationSeconds: 1,
    coldLoadMs: 100,
    transcriptionMs: 200,
    executionProvider: 'wasm' as const,
    cueCount: 1,
    modelId: 'test-model',
  },
};

describe('local transcription benchmark evidence lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('disables source changes during a run and clears stale result when a new file is selected', async () => {
    let finish!: (value: typeof result) => void;
    runMock.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
    render(<TranscriptionBenchmarkPage />);
    const chooser = screen.getByLabelText('Local video') as HTMLInputElement;
    fireEvent.change(chooser, { target: { files: [new File(['a'], 'first.mp4', { type: 'video/mp4' })] } });
    fireEvent.click(screen.getByRole('button', { name: 'Run local benchmark' }));
    expect(chooser).toBeDisabled();
    expect(runMock).toHaveBeenCalledTimes(1);
    await act(async () => { finish(result); });
    expect(chooser).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Download benchmark evidence' })).toBeEnabled();
    fireEvent.change(chooser, { target: { files: [new File(['b'], 'second.mp4', { type: 'video/mp4' })] } });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Download benchmark evidence' })).not.toBeInTheDocument());
    expect(screen.getByTestId('benchmark-status')).toHaveTextContent('idle');
  });
});
