import { createMockVideo, createTestFile, mockURLMethods } from './video-test-utils';

describe('video-test-utils', () => {
  describe('createMockVideo', () => {
    it('should create a mock video element with default properties', () => {
      const mockVideo = createMockVideo();
      expect(mockVideo).toBeDefined();
      expect(mockVideo.duration).toBe(10);
      expect(mockVideo.paused).toBe(true);
    });
  });

  describe('createTestFile', () => {
    it('should create a test file with default values', () => {
      const file = createTestFile();
      expect(file.name).toBe('test.mp4');
      expect(file.size).toBe(1024 * 1024);
      expect(file.type).toBe('video/mp4');
    });
  });

  describe('mockURLMethods', () => {
    it('should mock URL.createObjectURL and URL.revokeObjectURL', () => {
      // Mock the methods
      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      
      mockURLMethods();
      
      // Test createObjectURL
      const url = URL.createObjectURL(new Blob());
      expect(url).toBe('blob:mock-video');
      
      // Test revokeObjectURL doesn't throw
      expect(() => URL.revokeObjectURL(url)).not.toThrow();
      
      // Restore original methods
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });
  });
});
