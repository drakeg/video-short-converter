// This file sets up global mocks for tests

// Define missing types
declare global {
  interface Window {
    URL: {
      createObjectURL: (obj: Blob | MediaSource) => string;
      revokeObjectURL: (url: string) => void;
    };
  }

  interface TimeRanges {
    readonly length: number;
    start(index: number): number;
    end(index: number): number;
  }

  interface TextTrackList extends ArrayLike<TextTrack> {
    [index: number]: TextTrack;
    readonly length: number;
    selectedIndex: number;
    onchange: ((this: TextTrackList, ev: Event) => any) | null;
    onaddtrack: ((this: TextTrackList, ev: TrackEvent) => any) | null;
    onremovetrack: ((this: TextTrackList, ev: TrackEvent) => any) | null;
    getTrackById(id: string): TextTrack | null;
  }

  interface VideoTrackList extends ArrayLike<VideoTrack> {
    [index: number]: VideoTrack;
    readonly length: number;
    selectedIndex: number;
    onchange: ((this: VideoTrackList, ev: Event) => any) | null;
    onaddtrack: ((this: VideoTrackList, ev: TrackEvent) => any) | null;
    onremovetrack: ((this: VideoTrackList, ev: TrackEvent) => any) | null;
    getTrackById(id: string): VideoTrack | null;
  }

  interface AudioTrackList extends ArrayLike<AudioTrack> {
    [index: number]: AudioTrack;
    readonly length: number;
    onchange: ((this: AudioTrackList, ev: Event) => any) | null;
    onaddtrack: ((this: AudioTrackList, ev: TrackEvent) => any) | null;
    onremovetrack: ((this: AudioTrackList, ev: TrackEvent) => any) | null;
    getTrackById(id: string): AudioTrack | null;
  }

  interface TextTrack {
    id: string;
    kind: string;
    label: string;
    language: string;
    mode: string;
    cues: TextTrackCueList | null;
    activeCues: TextTrackCueList | null;
  }

  interface VideoTrack {
    id: string;
    kind: string;
    label: string;
    language: string;
    selected: boolean;
  }

  interface AudioTrack {
    id: string;
    kind: string;
    label: string;
    language: string;
    enabled: boolean;
  }
}

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-video-url');
const mockRevokeObjectURL = jest.fn();

// Mock requestAnimationFrame
const mockRequestAnimationFrame = (cb: FrameRequestCallback): number => {
  return window.setTimeout(cb, 0) as unknown as number;
};

const mockCancelAnimationFrame = (id: number): void => {
  window.clearTimeout(id);
};

// Mock performance.now()
const mockPerformanceNow = jest.fn().mockReturnValue(0);

// Set up global mocks
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;
global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = mockCancelAnimationFrame;
global.performance = {
  ...global.performance,
  now: mockPerformanceNow
};

// Mock HTMLVideoElement
class MockHTMLVideoElement extends HTMLElement {
  private _attributes: Record<string, string> = {};
  private _duration = 10; // Default duration in seconds
  private _currentTime = 0;
  private _videoWidth = 640;
  private _videoHeight = 360;
  private _readyState = 4; // HAVE_ENOUGH_DATA
  private _volume = 1;
  private _muted = false;
  private _paused = true;
  private _ended = false;
  private _src = '';
  private _currentSrc = '';
  private _networkState = 1; // NETWORK_IDLE
  private _preload = 'metadata';
  private _buffered = { length: 0 } as TimeRanges;
  private _seeking = false;
  private _seekable = { length: 0 } as TimeRanges;
  private _played = { length: 0 } as TimeRanges;
  private _textTracks = { length: 0 } as TextTrackList;
  private _videoTracks = { length: 0 } as VideoTrackList;
  private _audioTracks = { length: 0 } as AudioTrackList;
  
  constructor() {
    super();
    
    // Define properties with proper getters/setters
    Object.defineProperties(this, {
      duration: {
        get: function() { return this._duration; }, 
        set: function(value: number) { this._duration = value; },
        configurable: true,
        enumerable: true
      },
      paused: {
        get: () => this._paused,
        set: (value: boolean) => { this._paused = value; },
        configurable: true
      },
      currentTime: {
        get: () => this._currentTime,
        set: (value: number) => { this._currentTime = value; },
        configurable: true
      },
      videoWidth: {
        get: () => 640,
        configurable: true
      },
      videoHeight: {
        get: () => 360,
        configurable: true
      },
      readyState: {
        get: () => 4, // HAVE_ENOUGH_DATA
        configurable: true
      },
      preload: {
        get: () => 'metadata',
        set: (value: string) => { /* no-op */ },
        configurable: true
      }
    });
  }

  // Override setAttribute to track attributes
  setAttribute(name: string, value: string): void {
    this._attributes[name] = value;
    if (typeof super.setAttribute === 'function') {
      super.setAttribute(name, value);
    }
  }

  // Override getAttribute to return tracked attributes
  getAttribute(name: string): string | null {
    return this._attributes[name] ?? null;
  }

  // Override removeAttribute to remove tracked attributes
  removeAttribute(name: string): void {
    delete this._attributes[name];
    if (typeof super.removeAttribute === 'function') {
      super.removeAttribute(name);
    }
  }

  // Add getter/setter for duration
  get duration(): number {
    return this._duration;
  }

  set duration(value: number) {
    this._duration = value;
  }

  // Add getter/setter for paused
  get paused(): boolean {
    return this._paused;
  }

  set paused(value: boolean) {
    this._paused = value;
  }

  // Add getter/setter for currentTime
  get currentTime(): number {
    return this._currentTime;
  }

  set currentTime(value: number) {
    this._currentTime = value;
  }

  // Mock properties
  autoplay = false;
  buffered = { length: 0 } as TimeRanges;
  controls = false;
  crossOrigin: string | null = null;
  currentSrc = '';
  defaultMuted = false;
  defaultPlaybackRate = 1;
  disableRemotePlayback = false;
  ended = false;
  error = null;
  loop = false;
  mediaKeys = null;
  muted = false;
  networkState = 1; // NETWORK_IDLE
  playbackRate = 1;
  played = { length: 0 } as TimeRanges;
  preload = 'metadata';
  preservesPitch = true;
  readyState = 4; // HAVE_ENOUGH_DATA
  seekable = { length: 0 } as TimeRanges;
  seeking = false;
  sinkId = '';
  src = '';
  srcObject: MediaStream | MediaSource | Blob | null = null;
  textTracks = { length: 0 } as TextTrackList;
  videoTracks = { length: 0 } as VideoTrackList;
  volume = 1;
  width = 0;
  height = 0;
  videoWidth = 0;
  videoHeight = 0;
  poster = '';
  playsInline = false;
  disablePictureInPicture = false;

  // Mock methods
  play(): Promise<void> {
    this._paused = false;
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  }

  pause(): void {
    this._paused = true;
    this.dispatchEvent(new Event('pause'));
  }
  
  load(): void {
    this.dispatchEvent(new Event('loadstart'));
    this.dispatchEvent(new Event('loadedmetadata'));
    this.dispatchEvent(new Event('loadeddata'));
    this.dispatchEvent(new Event('canplay'));
  }

  addTextTrack() {
    return {} as TextTrack;
  }

  canPlayType() {
    return 'maybe';
  }

  captureStream() {
    return new MediaStream();
  }

  fastSeek() {
    return Promise.resolve();
  }

  getVideoPlaybackQuality() {
    return {
      creationTime: performance.now(),
      droppedVideoFrames: 0,
      totalVideoFrames: 0,
      corruptedVideoFrames: 0,
      totalFrameDelay: 0
    };
  }

  requestPictureInPicture() {
    return Promise.resolve({} as PictureInPictureWindow);
  }

  requestVideoFrameCallback(callback: (now: number, metadata: any) => void) {
    const handle = requestAnimationFrame(() => {
      callback(performance.now(), {
        presentationTime: performance.now(),
        expectedDisplayTime: performance.now(),
        width: this.videoWidth,
        height: this.videoHeight,
        mediaTime: this.currentTime,
        presentedFrames: 0,
        processingDuration: 0,
        captureTime: performance.now(),
        receiveTime: performance.now(),
        rtpTimestamp: 0
      });
    });
    return handle;
  }

  cancelVideoFrameCallback(handle: number) {
    cancelAnimationFrame(handle);
  }
}

// Store the original HTMLVideoElement
const OriginalHTMLVideoElement = global.HTMLVideoElement;

// Replace the global HTMLVideoElement with our mock
Object.defineProperty(global, 'HTMLVideoElement', {
  writable: true,
  value: MockHTMLVideoElement as unknown as typeof HTMLVideoElement
});

// Ensure document.createElement('video') returns our mock
const originalCreateElement = document.createElement;
document.createElement = function(tagName: string, options?: ElementCreationOptions) {
  if (tagName.toLowerCase() === 'video') {
    const video = new MockHTMLVideoElement();
    // Ensure the video element has all the expected properties
    const proto = Object.getPrototypeOf(video);
    if (!proto.hasOwnProperty('play')) {
      proto.play = async function() {
        this._paused = false;
        this.dispatchEvent(new Event('play'));
        return Promise.resolve();
      };
    }
    if (!proto.hasOwnProperty('pause')) {
      proto.pause = function() {
        this._paused = true;
        this.dispatchEvent(new Event('pause'));
      };
    }
    return video;
  }
  return originalCreateElement.call(document, tagName, options);
} as typeof document.createElement;

// Restore the original HTMLVideoElement after tests
if (typeof afterAll === 'function') {
  afterAll(() => {
    // Restore the original HTMLVideoElement
    Object.defineProperty(global, 'HTMLVideoElement', {
      writable: true,
      value: OriginalHTMLVideoElement
    });
    
    // Restore the original createElement
    document.createElement = originalCreateElement;
  });
}

// Export mocks for use in tests
export { mockCreateObjectURL, mockRevokeObjectURL };

// Add a test to satisfy Jest's requirement for at least one test
describe('setupTests', () => {
  it('should have a test', () => {
    expect(true).toBe(true);
  });
});
