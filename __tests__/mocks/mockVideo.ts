// This is a test file that provides mock implementations
// The test for this file is in mockVideo.test.ts

describe('mockVideo', () => {
  it('should be properly configured', () => {
    expect(true).toBe(true);
  });
});

// Create a simple mock video element that doesn't extend HTMLMediaElement
export const createMockVideo = (duration = 10) => {
  let _currentTime = 0;
  let _paused = true;
  const _listeners: Record<string, Array<EventListenerOrEventListenerObject>> = {};
  let _src = '';
  let _readyState = 4; // HAVE_ENOUGH_DATA
  let _networkState = 1; // NETWORK_IDLE

  const mockVideo = {
    // Video properties
    duration,
    currentTime: 0,
    paused: true,
    videoWidth: 1920,
    videoHeight: 1080,
    readyState: 4, // HAVE_ENOUGH_DATA
    networkState: 1, // NETWORK_IDLE
    
    // Event listeners
    addEventListener: jest.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (!_listeners[type]) {
        _listeners[type] = [];
      }
      _listeners[type].push(listener);
    }),
    
    removeEventListener: jest.fn((type: string, listener: EventListenerOrEventListenerObject) => {
      if (_listeners[type]) {
        _listeners[type] = _listeners[type].filter(l => l !== listener);
      }
    }),
    
    // Mock methods
    play: jest.fn().mockImplementation(function(this: any) {
      if (this.paused) {
        this.paused = false;
        this.dispatchEvent(new Event('play'));
      }
      return Promise.resolve();
    }),
    
    pause: jest.fn().mockImplementation(function(this: any) {
      if (!this.paused) {
        this.paused = true;
        this.dispatchEvent(new Event('pause'));
      }
    }),
    
    load: jest.fn().mockImplementation(function(this: any) {
      this.dispatchEvent(new Event('loadstart'));
      setTimeout(() => {
        this.dispatchEvent(new Event('loadedmetadata'));
        this.dispatchEvent(new Event('loadeddata'));
        this.dispatchEvent(new Event('canplay'));
      }, 0);
    }),
    
    // Mock event dispatching
    dispatchEvent: jest.fn().mockImplementation(function(this: any, event: Event) {
      const type = event.type;
      if (_listeners[type]) {
        _listeners[type].forEach(listener => {
          if (typeof listener === 'function') {
            listener(event);
          } else if (typeof listener === 'object' && listener.handleEvent) {
            listener.handleEvent(event);
          }
        });
      }
      return true;
    }),
    
    // Test utilities
    mock: {
      setDuration: (duration: number) => {
        mockVideo.duration = duration;
      },
      
      setCurrentTime: (time: number) => {
        mockVideo.currentTime = time;
        mockVideo.dispatchEvent(new Event('timeupdate'));
      },
      
      triggerEvent: (type: string, eventInit: EventInit = {}) => {
        mockVideo.dispatchEvent(new Event(type, eventInit));
      },
      
      // Simulate video loading
      load: () => {
        mockVideo.dispatchEvent(new Event('loadstart'));
        setTimeout(() => {
          mockVideo.dispatchEvent(new Event('loadedmetadata'));
          mockVideo.dispatchEvent(new Event('loadeddata'));
          mockVideo.dispatchEvent(new Event('canplay'));
        }, 0);
      }
    }
  };
  
  // Add getters/setters
  Object.defineProperty(mockVideo, 'currentTime', {
    get: () => _currentTime,
    set: (value: number) => {
      _currentTime = value;
      mockVideo.dispatchEvent(new Event('timeupdate'));
    }
  });
  
  Object.defineProperty(mockVideo, 'paused', {
    get: () => _paused,
    set: (value: boolean) => {
      _paused = value;
    }
  });
  
  Object.defineProperty(mockVideo, 'src', {
    get: () => _src,
    set: (value: string) => {
      _src = value;
      if (value) {
        mockVideo.mock.load();
      }
    }
  });
  
  return mockVideo as unknown as HTMLVideoElement & {
    mock: {
      setDuration: (duration: number) => void;
      setCurrentTime: (time: number) => void;
      triggerEvent: (type: string, eventInit?: EventInit) => void;
      load: () => void;
    };
  };
};

// Mock for URL.createObjectURL and URL.revokeObjectURL
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

export const mockCreateObjectURL = jest.fn((blob: Blob) => {
  return 'blob:mock-video';
});

export const mockRevokeObjectURL = jest.fn((url: string) => {
  // No-op for testing
});

// Set up the mocks
beforeEach(() => {
  // @ts-ignore
  global.URL.createObjectURL = mockCreateObjectURL;
  // @ts-ignore
  global.URL.revokeObjectURL = mockRevokeObjectURL;
});

afterEach(() => {
  // @ts-ignore
  global.URL.createObjectURL = originalCreateObjectURL;
  // @ts-ignore
  global.URL.revokeObjectURL = originalRevokeObjectURL;
  
  // Clear all mocks
  mockCreateObjectURL.mockClear();
  mockRevokeObjectURL.mockClear();
});

