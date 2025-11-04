import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the actual component for testing
import { VideoEditorContent } from '../../src/components/VideoEditor';

// Mock the video processor module
const mockTrimVideo = jest.fn().mockResolvedValue(new Blob());
jest.mock('@/utils/videoProcessor', () => ({
  trimVideo: mockTrimVideo
}));

// Mock next/dynamic
jest.mock('next/dynamic', () => (loader: any) => {
  return function DynamicComponent(props: any) {
    const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
    
    React.useEffect(() => {
      const load = async () => {
        const module = await loader();
        setComponent(() => module.default);
      };
      load();
    }, []);
    
    return Component ? <Component {...props} /> : null;
  };
});

// Mock window.URL.createObjectURL
const mockCreateObjectURL = jest.fn((blob: Blob | MediaSource) => 'blob:mock-video');
const mockRevokeObjectURL = jest.fn((url: string) => {});

// Mock the global URL object
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

// Mock Notification API
const mockRequestPermission = jest.fn().mockResolvedValue('granted');
Object.defineProperty(window, 'Notification', {
  value: {
    requestPermission: mockRequestPermission,
    permission: 'granted',
  },
  writable: true,
});

describe('VideoEditor', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    await act(async () => {
      render(<VideoEditorContent />);
    });
    expect(screen.getByText('No video selected')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    
    await act(async () => {
      render(<VideoEditorContent />);
    });
    
    // Open file dialog
    const selectButton = screen.getByText('Select Video');
    fireEvent.click(selectButton);
    
    // Simulate file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fireEvent.change(fileInput);
    
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
    });
  });

  it('handles video playback controls', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    
    await act(async () => {
      render(<VideoEditorContent />);
    });
    
    // Open file dialog and select file
    const selectButton = screen.getByText('Select Video');
    fireEvent.click(selectButton);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    await act(async () => {
      fireEvent.change(fileInput);
    });
    
    // Wait for video to be loaded
    const video = await screen.findByRole('video');
    
    // Mock video methods
    const playMock = jest.fn();
    const pauseMock = jest.fn();
    Object.defineProperty(video, 'play', { value: playMock });
    Object.defineProperty(video, 'pause', { value: pauseMock });
    
    // Test play/pause by clicking on the video
    fireEvent.click(video);
    expect(playMock).toHaveBeenCalled();
    
    // Simulate video playing
    fireEvent.play(video);
    
    // Click again to pause
    fireEvent.click(video);
    expect(pauseMock).toHaveBeenCalled();
  });

  it('handles trim functionality', async () => {
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    
    await act(async () => {
      render(<VideoEditorContent />);
    });
    
    // Open file dialog and select file
    const selectButton = screen.getByText('Select Video');
    fireEvent.click(selectButton);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    
    await act(async () => {
      fireEvent.change(fileInput);
    });
    
    // Wait for video to be loaded
    const video = await screen.findByRole('video');
    
    // Set video duration and current time for testing
    Object.defineProperty(video, 'duration', { value: 30, writable: true });
    Object.defineProperty(video, 'currentTime', { value: 0, writable: true });
    
    // Trigger loadedmetadata event
    fireEvent.loadedMetadata(video);
    
    // Wait for video controls to be available
    await waitFor(() => {
      expect(screen.getByText('0:00 / 0:30')).toBeInTheDocument();
    });
    
    // Set start time (current time is 0)
    const setStartButton = screen.getByText('Set Start');
    fireEvent.click(setStartButton);
    
    // Update current time to 10 seconds
    Object.defineProperty(video, 'currentTime', { value: 10 });
    fireEvent.timeUpdate(video);
    
    // Set end time
    const setEndButton = screen.getByText('Set End');
    fireEvent.click(setEndButton);
    
    // Click create short button
    const createButton = screen.getByText('Create Short');
    fireEvent.click(createButton);
    
    // Wait for processing to start
    await waitFor(() => {
      expect(screen.getByText(/Processing/)).toBeInTheDocument();
    });
    
    // Verify trimVideo was called with correct parameters
    expect(mockTrimVideo).toHaveBeenCalledWith(
      expect.any(File),
      0, // start time (from setStartButton click)
      10, // end time (from setEndButton click)
      expect.any(Function) // progress callback
    );
  });
});
