// Add jest-dom's custom assertions
require('@testing-library/jest-dom');

// Mock next/head
jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

// Mock next/dynamic
jest.mock('next/dynamic', () => (func) => {
  const component = func();
  if (component && component.then) {
    return component.then(module => {
      const DynamicComponent = module.default || module;
      DynamicComponent.displayName = 'LoadableComponent';
      DynamicComponent.preload = jest.fn();
      // Return a simple wrapper component that renders the dynamic component
      return function Wrapper(props) {
        return DynamicComponent ? <DynamicComponent {...props} /> : null;
      };
    });
  }
  
  const DynamicComponent = component.default || component;
  DynamicComponent.displayName = 'LoadableComponent';
  DynamicComponent.preload = jest.fn();
  return DynamicComponent;
});

// Mock the VideoEditor component to use the actual component directly
jest.mock('@/components/VideoEditor', () => {
  const actual = jest.requireActual('@/components/VideoEditor');
  // Return the actual VideoEditorContent component for testing
  return {
    __esModule: true,
    default: actual.VideoEditorContent || (() => null)
  };
});

// Mock HTMLMediaElement
class MockHTMLMediaElement extends HTMLMediaElement {
  constructor() {
    super();
    // Mock properties
    this.paused = true;
    this.currentTime = 0;
    this.duration = 10; // 10 second default duration
    this.readyState = 4; // HAVE_ENOUGH_DATA
    this.networkState = 1; // NETWORK_IDLE
    this.videoWidth = 1920;
    this.videoHeight = 1080;
    this.src = '';
    this._listeners = {};
  }

  // Mock methods
  play() {
    this.paused = false;
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }

  load() {
    this.dispatchEvent(new Event('loadstart'));
    setTimeout(() => {
      this.dispatchEvent(new Event('loadedmetadata'));
      this.dispatchEvent(new Event('loadeddata'));
      this.dispatchEvent(new Event('canplay'));
    }, 0);
  }

  // Event handling
  addEventListener(type, listener) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (this._listeners[type]) {
      this._listeners[type] = this._listeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(event) {
    const type = event.type;
    if (this._listeners[type]) {
      this._listeners[type].forEach(listener => {
        if (typeof listener === 'function') {
          listener(event);
        } else if (listener && typeof listener.handleEvent === 'function') {
          listener.handleEvent(event);
        }
      });
    }
    return true;
  }

  // Test utilities
  _test = {
    setCurrentTime: (time) => {
      this.currentTime = time;
      this.dispatchEvent(new Event('timeupdate'));
    },
    setDuration: (duration) => {
      this.duration = duration;
    },
    triggerEvent: (type, eventInit = {}) => {
      this.dispatchEvent(new Event(type, eventInit));
    },
    simulateLoad: () => {
      this.dispatchEvent(new Event('loadstart'));
      setTimeout(() => {
        this.dispatchEvent(new Event('loadedmetadata'));
        this.dispatchEvent(new Event('loadeddata'));
        this.dispatchEvent(new Event('canplay'));
      }, 0);
    }
  };
}

// Mock video element
Object.defineProperty(global, 'HTMLVideoElement', {
  writable: true,
  value: MockHTMLMediaElement,
});

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-video-url');
const mockRevokeObjectURL = jest.fn();

global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

// Export mocks for use in tests
global.mockCreateObjectURL = mockCreateObjectURL;
global.mockRevokeObjectURL = mockRevokeObjectURL;

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => {
  return setTimeout(cb, 0);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};
