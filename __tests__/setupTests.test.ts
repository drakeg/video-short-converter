import { jest } from '@jest/globals';

describe('setupTests', () => {
  // Mock URL.createObjectURL
  const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-video');
  
  // Mock requestAnimationFrame
  let mockCallback: FrameRequestCallback;
  const mockRequestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
    mockCallback = callback;
    return 1; // Return a mock frame ID
  });
  
  const mockCancelAnimationFrame = jest.fn();
  
  beforeAll(() => {
    // @ts-ignore
    global.URL.createObjectURL = mockCreateObjectURL;
    global.requestAnimationFrame = mockRequestAnimationFrame as any;
    global.cancelAnimationFrame = mockCancelAnimationFrame as any;
    
    // Mock performance.now()
    global.performance = {
      ...global.performance,
      now: jest.fn().mockReturnValue(1000)
    } as any;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should mock URL.createObjectURL', () => {
    const blob = new Blob();
    const url = URL.createObjectURL(blob);
    expect(url).toBe('blob:mock-video');
    expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
  });

  it('should mock requestAnimationFrame', () => {
    const callback = jest.fn();
    
    // Test requestAnimationFrame
    const requestId = requestAnimationFrame(callback);
    
    // Simulate the animation frame
    mockCallback(performance.now());
    
    expect(callback).toHaveBeenCalledTimes(1);
    
    // Test cancelAnimationFrame
    cancelAnimationFrame(requestId);
    expect(mockCancelAnimationFrame).toHaveBeenCalledWith(requestId);
  });

  it('should mock video element with basic functionality', async () => {
    // Create a mock video element with proper property handling
    const video = document.createElement('video');
    
    // Test that our mock is being used
    expect(video).toBeInstanceOf(HTMLElement);
    
    // Create a mock implementation that tracks play/pause state
    let isPaused = true;
    
    // Override the video element's properties and methods
    Object.defineProperties(video, {
      duration: {
        value: 10,
        writable: true,
        configurable: true
      },
      paused: {
        get: () => isPaused,
        configurable: true
      },
      currentTime: {
        value: 0,
        writable: true,
        configurable: true
      },
      videoWidth: {
        value: 640,
        configurable: true
      },
      videoHeight: {
        value: 360,
        configurable: true
      }
    });
    
    // Mock play/pause methods with proper typing
    video.play = jest.fn().mockImplementation(function(): Promise<void> {
      isPaused = false;
      return Promise.resolve();
    });
    
    video.pause = jest.fn().mockImplementation(function() {
      isPaused = true;
    });
    
    // Test default properties
    expect(video.duration).toBe(10);
    expect(video.paused).toBe(true);
    
    // Test play method
    await video.play();
    expect(isPaused).toBe(false);
    
    // Test pause method
    video.pause();
    expect(isPaused).toBe(true);
    
    // Test event handling
    const playHandler = jest.fn();
    video.addEventListener('play', playHandler);
    video.dispatchEvent(new Event('play'));
    expect(playHandler).toHaveBeenCalled();
    
    // Test setting properties
    video.currentTime = 5;
    expect(video.currentTime).toBe(5);
    
    // Ensure video has required properties
    expect(video.videoWidth).toBe(640);
    expect(video.videoHeight).toBe(360);
  });
});
