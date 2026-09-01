'use client';

interface TimelineControlsProps {
  duration: number;
  currentTime: number;
  startTime: number | null;
  endTime: number | null;
  onSeek: (time: number) => void;
  onStartChange: (time: number) => void;
  onEndChange: (time: number) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
};

export default function TimelineControls({
  duration,
  currentTime,
  startTime,
  endTime,
  onSeek,
  onStartChange,
  onEndChange,
}: TimelineControlsProps) {
  const safeDuration = Math.max(duration, 0.1);
  const start = startTime ?? 0;
  const end = endTime ?? duration;
  const startPercent = (start / safeDuration) * 100;
  const endPercent = (end / safeDuration) * 100;

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Timeline</span>
        <span className="font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-gray-300">
        <div
          className="absolute inset-y-0 bg-blue-500/40"
          style={{ left: `${startPercent}%`, right: `${Math.max(0, 100 - endPercent)}%` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-blue-700"
          style={{ left: `${Math.min(100, (currentTime / safeDuration) * 100)}%` }}
          aria-hidden="true"
        />
      </div>

      <label className="block text-xs font-medium text-gray-600">
        Playhead
        <input
          aria-label="Playhead"
          type="range"
          min={0}
          max={safeDuration}
          step={0.01}
          value={Math.min(currentTime, safeDuration)}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="mt-1 w-full"
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-medium text-gray-600">
          In point: {formatTime(start)}
          <input
            aria-label="Trim start"
            type="range"
            min={0}
            max={safeDuration}
            step={0.01}
            value={start}
            onChange={(event) => onStartChange(Math.min(Number(event.target.value), Math.max(0, end - 0.05)))}
            className="mt-1 w-full"
          />
        </label>

        <label className="text-xs font-medium text-gray-600">
          Out point: {formatTime(end)}
          <input
            aria-label="Trim end"
            type="range"
            min={0}
            max={safeDuration}
            step={0.01}
            value={Math.min(end, safeDuration)}
            onChange={(event) => onEndChange(Math.max(Number(event.target.value), start + 0.05))}
            className="mt-1 w-full"
          />
        </label>
      </div>
    </div>
  );
}
