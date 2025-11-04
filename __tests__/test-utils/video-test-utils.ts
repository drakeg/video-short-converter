// Utility functions for testing video-related components

describe('video-test-utils', () => {
  it('should be properly configured', () => {
    expect(true).toBe(true);
  });
});

/**
 * Creates a mock video element for testing
 */
export function createMockVideo() {
  const mockVideo = document.createElement('video');
  
  // Mock properties
  Object.defineProperties(mockVideo, {
    currentTime: {
      value: 0,
      writable: true
    },
    duration: {
      value: 10, // 10 seconds
      writable: true
    },
    paused: {
      value: true,
      writable: true
    },
    readyState: {
      value: 4, // HAVE_ENOUGH_DATA
      writable: true
    },
    videoWidth: {
      value: 1920,
      writable: true
    },
    videoHeight: {
      value: 1080,
      writable: true
    },
    src: {
      value: '',
      writable: true
    },
    play: {
      value: jest.fn().mockResolvedValue(undefined)
    },
    pause: {
      value: jest.fn()
    },
    addEventListener: {
      value: jest.fn()
    },
    removeEventListener: {
      value: jest.fn()
    }
  });

  return mockVideo;
}

/**
 * Creates a test file for upload
 */
export function createTestFile(name = 'test.mp4', size = 1024 * 1024, type = 'video/mp4') {
  return new File(['x'.repeat(size)], name, { type });
}

/**
 * Mocks the URL.createObjectURL and URL.revokeObjectURL methods
 */
export function mockURLMethods() {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  
  // @ts-ignore
  global.URL.createObjectURL = jest.fn().mockImplementation((blob: Blob) => 'blob:mock-video');
  // @ts-ignore
  global.URL.revokeObjectURL = jest.fn();
  
  // Return a function to restore the original methods
  return () => {
    // @ts-ignore
    global.URL.createObjectURL = originalCreateObjectURL;
    // @ts-ignore
    global.URL.revokeObjectURL = originalRevokeObjectURL;
  };
}

/**
 * Mocks the document.createElement method to return a mock video element
 */
export function mockCreateElement() {
  const mockVideo = createMockVideo();
  const originalCreateElement = document.createElement;
  
  // Mock document.createElement
  document.createElement = jest.fn().mockImplementation((tagName) => {
    if (tagName === 'video') {
      return mockVideo;
    }
    return originalCreateElement.call(document, tagName);
  });
  
  // Return the mock video and cleanup function
  return {
    mockVideo,
    cleanup: () => {
      document.createElement = originalCreateElement;
    }
  };
}

/**
 * Sets up the test environment for video testing
 */
export function setupVideoTest() {
  // Mock URL methods
  const cleanupURL = mockURLMethods();
  
  // Mock createElement
  const { mockVideo, cleanup: cleanupCreateElement } = mockCreateElement();
  
  // Return the mock video and cleanup function
  return {
    mockVideo,
    cleanup: () => {
      cleanupURL();
      cleanupCreateElement();
    }
  };
}
