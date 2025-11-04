import { createMockVideo, mockCreateObjectURL, mockRevokeObjectURL } from './mockVideo';

describe('mockVideo', () => {
  describe('createMockVideo', () => {
    it('should create a mock video with default duration', () => {
      const video = createMockVideo();
      expect(video.duration).toBe(10);
      expect(video.paused).toBe(true);
      expect(video.readyState).toBe(4); // HAVE_ENOUGH_DATA
    });

    it('should allow setting currentTime', () => {
      const video = createMockVideo();
      video.currentTime = 5;
      expect(video.currentTime).toBe(5);
    });

    it('should handle play and pause', () => {
      const video = createMockVideo();
      
      // Mock event dispatching
      const playHandler = jest.fn();
      const pauseHandler = jest.fn();
      
      video.addEventListener('play', playHandler);
      video.addEventListener('pause', pauseHandler);
      
      // Test play
      video.play();
      expect(video.paused).toBe(false);
      expect(playHandler).toHaveBeenCalledTimes(1);
      
      // Test pause
      video.pause();
      expect(video.paused).toBe(true);
      expect(pauseHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('URL mocks', () => {
    it('should mock createObjectURL', () => {
      const blob = new Blob();
      const url = URL.createObjectURL(blob);
      expect(url).toBe('blob:mock-video');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
    });

    it('should mock revokeObjectURL', () => {
      const url = 'blob:test';
      URL.revokeObjectURL(url);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith(url);
    });
  });
});
