'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import ExportSettings from './video-editor/ExportSettings';
import FramingOverlay from './video-editor/FramingOverlay';
import TimelineControls from './video-editor/TimelineControls';
import VideoUploader from './video-editor/VideoUploader';
import { DEFAULT_PRESET, getExportPreset } from './video-editor/editorConfig';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
};

export const VideoEditorContent = () => {
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
  const [presetId, setPresetId] = useState(DEFAULT_PRESET.id);
  const [cropPosition, setCropPosition] = useState(50);
  const [frameRate, setFrameRate] = useState(30);
  const [sourceWidth, setSourceWidth] = useState(0);
  const [sourceHeight, setSourceHeight] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const preset = getExportPreset(presetId);

  const clearDurationInterval = useCallback(() => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  }, []);

  const handleFileSelected = useCallback((file: File) => {
    setVideoUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return URL.createObjectURL(file);
    });
    setOriginalFile(file);
    setVideoDuration(0);
    setCurrentTime(0);
    setStartTime(null);
    setEndTime(null);
    setTrimDuration(0);
    setSourceWidth(0);
    setSourceHeight(0);
    setError(null);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration;
    setVideoDuration(duration);
    setEndTime(duration);
    setSourceWidth(videoRef.current.videoWidth);
    setSourceHeight(videoRef.current.videoHeight);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    if (startTime !== null && endTime === null) {
      setTrimDuration(Math.max(0, time - startTime));
    }

    if (videoDuration > 0 && time >= videoDuration - 0.1 && startTime !== null && endTime === null) {
      setEndTime(videoDuration);
      setTrimDuration(videoDuration - startTime);
      clearDurationInterval();
    }
  }, [clearDurationInterval, endTime, startTime, videoDuration]);

  const seekToTime = useCallback((time: number) => {
    if (!videoRef.current) return;
    const boundedTime = Math.max(0, Math.min(time, videoDuration || 0));
    videoRef.current.currentTime = boundedTime;
    setCurrentTime(boundedTime);

    if (startTime !== null && endTime === null) {
      setTrimDuration(Math.max(0, boundedTime - startTime));
    }
  }, [endTime, startTime, videoDuration]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play().catch((playError) => {
        console.error('Error playing video:', playError);
      });
    } else {
      videoRef.current.pause();
    }
  }, []);

  const seekByFrames = useCallback((frameCount: number) => {
    if (!videoRef.current) return;
    const frameDuration = 1 / frameRate;
    seekToTime(videoRef.current.currentTime + frameCount * frameDuration);
  }, [frameRate, seekToTime]);

  const quickJump = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    seekToTime(videoRef.current.currentTime + seconds);
  }, [seekToTime]);

  const handleMarkStart = useCallback(() => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime < 0.5 ? 0 : videoRef.current.currentTime;
    setStartTime(time);
    setEndTime(null);
    setTrimDuration(0);
    clearDurationInterval();

    durationInterval.current = setInterval(() => {
      if (videoRef.current) {
        setTrimDuration(Math.max(0, videoRef.current.currentTime - time));
      }
    }, 100);
  }, [clearDurationInterval]);

  const handleMarkEnd = useCallback(() => {
    if (!videoRef.current) return;
    const effectiveStart = startTime ?? 0;
    const time = Math.max(effectiveStart, videoRef.current.currentTime);
    setStartTime(effectiveStart);
    setEndTime(time);
    setTrimDuration(time - effectiveStart);
    clearDurationInterval();

    if (!videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, [clearDurationInterval, startTime]);

  const handleTimelineStartChange = useCallback((time: number) => {
    const bounded = Math.max(0, Math.min(time, endTime ?? videoDuration));
    setStartTime(bounded);
    if (endTime !== null) setTrimDuration(Math.max(0, endTime - bounded));
  }, [endTime, videoDuration]);

  const handleTimelineEndChange = useCallback((time: number) => {
    const effectiveStart = startTime ?? 0;
    const bounded = Math.max(effectiveStart, Math.min(time, videoDuration));
    setStartTime(effectiveStart);
    setEndTime(bounded);
    setTrimDuration(bounded - effectiveStart);
  }, [startTime, videoDuration]);

  const handleTrimAndDownload = useCallback(async () => {
    if (!originalFile || isTrimming || startTime === null || endTime === null || endTime <= startTime) return;

    try {
      setIsTrimming(true);
      setError(null);
      setTrimProgress(0);

      const { trimVideo } = await import('@/utils/videoProcessor');
      const trimmedBlob = await trimVideo(
        originalFile,
        startTime,
        endTime,
        (progress) => {
          const normalized = progress > 1 ? progress / 100 : progress;
          setTrimProgress(Math.min(0.95, Math.max(0, normalized)));
        },
        { presetId, cropPosition },
      );

      setTrimProgress(0.98);
      const url = URL.createObjectURL(trimmedBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = trimmedBlob.name || `short-${Date.now()}.mp4`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setTrimProgress(1);

      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Video Processing Complete', {
          body: 'Your video has been trimmed and downloaded!',
          icon: '/favicon.ico',
        });
      }
    } catch (trimError) {
      console.error('Error trimming video:', trimError);
      setError('Failed to trim video. Please try again.');
    } finally {
      setIsTrimming(false);
    }
  }, [cropPosition, endTime, isTrimming, originalFile, presetId, startTime]);

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target?.tagName ?? '')) return;
      if (!videoUrl) return;

      if (event.code === 'Space') {
        event.preventDefault();
        togglePlayPause();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        seekByFrames(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        seekByFrames(1);
      } else if (event.key.toLowerCase() === 'i') {
        handleMarkStart();
      } else if (event.key.toLowerCase() === 'o') {
        handleMarkEnd();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleMarkEnd, handleMarkStart, seekByFrames, togglePlayPause, videoUrl]);

  useEffect(() => () => clearDurationInterval(), [clearDurationInterval]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Video Trimmer</h1>
          <p className="mt-1 text-sm text-gray-500">Trim, frame, and export a social-ready clip.</p>
        </div>
        {videoUrl && (
          <div className="text-xs text-gray-500">
            Shortcuts: Space play/pause · I mark in · O mark out · ←/→ one frame
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-lg bg-white p-4 shadow-md">
        {!videoUrl ? (
          <VideoUploader onFileSelected={handleFileSelected} />
        ) : (
          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-lg bg-black">
              <div className="relative aspect-video">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="absolute inset-0 h-full w-full object-contain"
                  controls={false}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  aria-label="Video player"
                />
                <FramingOverlay
                  sourceWidth={sourceWidth}
                  sourceHeight={sourceHeight}
                  preset={preset}
                  cropPosition={cropPosition}
                  onCropPositionChange={setCropPosition}
                />
              </div>
            </div>

            <ExportSettings
              presetId={presetId}
              frameRate={frameRate}
              cropPosition={cropPosition}
              onPresetChange={setPresetId}
              onFrameRateChange={setFrameRate}
              onCropPositionChange={setCropPosition}
            />

            <TimelineControls
              duration={videoDuration}
              currentTime={currentTime}
              startTime={startTime}
              endTime={endTime}
              onSeek={seekToTime}
              onStartChange={handleTimelineStartChange}
              onEndChange={handleTimelineEndChange}
            />

            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => quickJump(-5)} className="rounded-lg bg-gray-200 px-3 py-2 font-medium hover:bg-gray-300" title="Jump back 5 seconds">-5s</button>
              <button onClick={() => seekByFrames(-1)} className="rounded-lg bg-gray-200 px-3 py-2 font-medium hover:bg-gray-300" title="Previous frame">← Frame</button>
              <button onClick={togglePlayPause} className="rounded-lg bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700">{isPlaying ? 'Pause' : 'Play'}</button>
              <button onClick={() => seekByFrames(1)} className="rounded-lg bg-gray-200 px-3 py-2 font-medium hover:bg-gray-300" title="Next frame">Frame →</button>
              <button onClick={() => quickJump(5)} className="rounded-lg bg-gray-200 px-3 py-2 font-medium hover:bg-gray-300" title="Jump forward 5 seconds">+5s</button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={handleMarkStart}
                className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
              >
                {startTime === null ? 'Mark Start' : `Start: ${formatTime(startTime)}`}
              </button>
              <button
                onClick={handleMarkEnd}
                className="rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700"
              >
                {endTime === null ? 'Mark End' : `End: ${formatTime(endTime)}`}
              </button>
            </div>

            <button
              onClick={handleTrimAndDownload}
              disabled={isTrimming || startTime === null || endTime === null || endTime <= startTime}
              className={`w-full rounded-lg px-4 py-3 font-medium text-white transition-colors ${
                startTime !== null && endTime !== null && endTime > startTime && !isTrimming
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'cursor-not-allowed bg-gray-400'
              }`}
            >
              {isTrimming
                ? `Processing... ${Math.round(trimProgress * 100)}%`
                : `Download ${formatTime(trimDuration)} Short`}
            </button>

            {isTrimming && (
              <div className="w-full">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-2.5 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${Math.round(trimProgress * 100)}%` }} />
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
                  setVideoDuration(0);
                  setCurrentTime(0);
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

const VideoEditor = () => {
  if (typeof window === 'undefined') {
    return <div className="flex min-h-[400px] items-center justify-center">Loading video editor...</div>;
  }
  return <VideoEditorContent />;
};

export default dynamic(() => Promise.resolve(VideoEditor), { ssr: false });
