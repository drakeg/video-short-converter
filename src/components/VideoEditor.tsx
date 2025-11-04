'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

interface VideoProcessor {
  trimVideo: (file: File, start: number, end: number, onProgress: (progress: number) => void) => Promise<Blob>;
}

// Format time in seconds to MM:SS.SSS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
};

export const VideoEditorContent = () => {
  // State management
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimProgress, setTrimProgress] = useState(0);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trimDuration, setTrimDuration] = useState(0);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setError(null);
  }, []);

  // Handle video metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration;
    setVideoDuration(duration);
    setEndTime(duration);
  }, []);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      // If we're starting playback, reset the trim state
      if (startTime !== null || endTime !== null) {
        setStartTime(null);
        setEndTime(null);
        setTrimDuration(0);
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, startTime, endTime]);

  // Handle mark start
  const handleMarkStart = useCallback(() => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setStartTime(time);
    setEndTime(null);
    
    // Start the duration timer
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    
    durationInterval.current = setInterval(() => {
      if (videoRef.current) {
        const current = videoRef.current.currentTime;
        setTrimDuration(current - time);
      }
    }, 100);
  }, []);

  // Handle mark end
  const handleMarkEnd = useCallback(() => {
    if (!videoRef.current) return;
    
    // If start time isn't set, use current time as start time
    if (startTime === null) {
      setStartTime(0);
    }
    
    const time = videoRef.current.currentTime;
    setEndTime(time);
    
    // Stop video playback
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    
    // Stop the duration timer
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    
    setTrimDuration(time - (startTime || 0));
  }, [startTime, isPlaying]);

  // Handle trim and download
  const handleTrimAndDownload = useCallback(async () => {
    if (!originalFile || isTrimming || startTime === null || endTime === null) return;
    
    try {
      setIsTrimming(true);
      setError(null);
      
      // Reset progress at start
      setTrimProgress(0);
      
      // Import video processor dynamically to avoid SSR issues
      const { trimVideo } = await import('@/utils/videoProcessor');
      
      // Split progress into two phases: processing (0-90%) and finalizing (90-100%)
      const processingProgress = (progress: number) => {
        // First 90% is for processing, last 10% is for finalizing
        const processingPhase = Math.min(1, progress * 1.1); // Scale to 90%
        setTrimProgress(processingPhase);
      };
      
      const trimmedBlob = await trimVideo(
        originalFile,
        startTime,
        endTime,
        processingProgress
      );
      
      // Update to finalizing state
      setTrimProgress(0.95); // 95% - preparing download
      
      // Small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create download link
      const url = URL.createObjectURL(trimmedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `short-${new Date().getTime()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Complete the progress
      setTrimProgress(1);
      
      // Show success notification
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Video Processing Complete', {
          body: 'Your video has been trimmed and downloaded!',
          icon: '/favicon.ico'
        });
      }
      
    } catch (err) {
      console.error('Error trimming video:', err);
      setError('Failed to trim video. Please try again.');
    } finally {
      setIsTrimming(false);
    }
  }, [originalFile, isTrimming, startTime, endTime]);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  // Clean up
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Video Trimmer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        {!videoUrl ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="video/*"
              onChange={handleFileChange}
            />
            <p className="text-gray-600">Click or drop a video file here</p>
            <p className="text-sm text-gray-400 mt-2">Supported formats: MP4, WebM, OGG</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-black rounded-lg overflow-hidden" style={{ maxHeight: '60vh' }}>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  controls={false}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onClick={togglePlayPause}
                  aria-label="Video player"
                />
                
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    background: 'rgba(0,0,0,0.3)'
                  }}
                  onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                  onMouseOut={e => (e.currentTarget.style.opacity = '0')}
                >
                  <button
                    onClick={togglePlayPause}
                    className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      !videoUrl || isTrimming
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
                    }`}
                    disabled={!videoUrl || isTrimming}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>
                
                {/* Timer overlay */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1rem'
                  }}
                >
                  <div 
                    style={{
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {formatTime(currentTime)} / {formatTime(videoDuration)}
                  </div>
                  {startTime !== null && endTime !== null && (
                    <div 
                      style={{
                        background: '#2563eb',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem'
                      }}
                    >
                      Trim: {formatTime(trimDuration)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Control buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleMarkStart}
                disabled={startTime !== null && endTime === null}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  startTime === null 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {startTime === null ? 'Mark Start' : `Start: ${formatTime(startTime)}`}
              </button>
              
              <button
                onClick={handleMarkEnd}
                disabled={startTime === null || endTime !== null}
                className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                  startTime !== null && endTime === null
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {endTime === null ? 'Mark End' : `End: ${formatTime(endTime || 0)}`}
              </button>
            </div>
            
            {/* Trim and download button */}
            <button
              onClick={handleTrimAndDownload}
              disabled={isTrimming || startTime === null || endTime === null}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                startTime !== null && endTime !== null && !isTrimming
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isTrimming 
                ? `Processing... ${Math.round(trimProgress * 100)}%` 
                : `Download ${formatTime(trimDuration)} Short`
              }
            </button>
            
            {/* Progress bar */}
            {isTrimming && (
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      trimProgress >= 0.9 ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, trimProgress * 100))}%`,
                      maxWidth: '100%' 
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>
                    {trimProgress < 0.1 ? 'Starting...' : 
                     trimProgress < 0.9 ? 'Processing video...' : 
                     trimProgress < 1 ? 'Finalizing...' : 'Complete!'}
                  </span>
                  <span>{Math.round(Math.min(100, trimProgress * 100))}%</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setVideoUrl(null);
                  setOriginalFile(null);
                  setStartTime(null);
                  setEndTime(null);
                  setTrimDuration(0);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Upload Different Video
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Client-side only component wrapper
const VideoEditor = () => {
  if (typeof window === 'undefined') {
    return <div className="min-h-[400px] flex items-center justify-center">Loading video editor...</div>;
  }
  
  return <VideoEditorContent />;
};

export default dynamic(() => Promise.resolve(VideoEditor), { 
  ssr: false 
});
