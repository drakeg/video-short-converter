import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/dynamic', () => () => function MockDynamicComponent() {
  return null;
});

const { VideoEditorContent } = jest.requireActual('../../src/components/VideoEditor') as typeof import('../../src/components/VideoEditor');

const mockCreateObjectURL = jest.fn(() => 'blob:mock-video');
const mockRevokeObjectURL = jest.fn();

Object.defineProperty(window.URL, 'createObjectURL', { value: mockCreateObjectURL, writable: true });
Object.defineProperty(window.URL, 'revokeObjectURL', { value: mockRevokeObjectURL, writable: true });
Object.defineProperty(window, 'Notification', {
  value: { requestPermission: jest.fn().mockResolvedValue('granted'), permission: 'granted' },
  writable: true,
});

describe('VideoEditor', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('renders the empty editor state', () => {
    render(<VideoEditorContent />);
    expect(screen.getByRole('heading', { name: 'Video Trimmer' })).toBeInTheDocument();
    expect(screen.getByText('Click or drop a video file here')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const { container } = render(<VideoEditorContent />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await act(async () => { fireEvent.change(fileInput, { target: { files: [file] } }); });
    expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByLabelText('Video player')).toBeInTheDocument();
  });

  it('keeps primary editing controls grouped with the video', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const { container } = render(<VideoEditorContent />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const editingControls = screen.getByRole('region', { name: 'Video editing controls' });
    expect(within(editingControls).getByLabelText('Video player')).toBeInTheDocument();
    expect(within(editingControls).getByRole('button', { name: 'Mark Start' })).toBeInTheDocument();
    expect(within(editingControls).getByRole('button', { name: 'Mark End' })).toBeInTheDocument();
    expect(within(editingControls).getByRole('button', { name: /Process .* Short/ })).toBeInTheDocument();

    const options = screen.getByRole('complementary', { name: 'Editing options and clip queue' });
    expect(options).toBeInTheDocument();
  });

  it('places transport and mark controls before timeline fields', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const { container } = render(<VideoEditorContent />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const markStart = screen.getByRole('button', { name: 'Mark Start' });
    const playhead = screen.getByLabelText('Playhead');
    const exactStart = screen.getByLabelText('Exact trim start');

    expect(markStart.compareDocumentPosition(playhead) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(markStart.compareDocumentPosition(exactStart) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows loaded video duration', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const { container } = render(<VideoEditorContent />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    const video = screen.getByLabelText('Video player') as HTMLVideoElement;
    Object.defineProperty(video, 'duration', { value: 30, configurable: true });
    fireEvent.loadedMetadata(video);
    await waitFor(() => { expect(screen.getByText('00:00.0 / 00:30.0')).toBeInTheDocument(); });
  });

  it('marks a trim start and end using the current video time', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const { container } = render(<VideoEditorContent />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });
    const video = screen.getByLabelText('Video player') as HTMLVideoElement;
    Object.defineProperty(video, 'duration', { value: 30, configurable: true });
    Object.defineProperty(video, 'currentTime', { value: 1, writable: true, configurable: true });
    fireEvent.loadedMetadata(video);
    fireEvent.click(screen.getByRole('button', { name: 'Mark Start' }));
    expect(screen.getByRole('button', { name: 'Start: 00:01.0' })).toBeInTheDocument();
    video.currentTime = 10;
    fireEvent.timeUpdate(video);
    fireEvent.click(screen.getByRole('button', { name: 'Mark End' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'End: 00:10.0' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Process 00:09.0 Short' })).toBeEnabled();
    });
  });
});
