'use client';

import { EXPORT_PRESETS, FRAME_RATE_OPTIONS, getExportPreset } from './editorConfig';

interface ExportSettingsProps {
  presetId: string;
  frameRate: number;
  cropPosition: number;
  onPresetChange: (presetId: string) => void;
  onFrameRateChange: (frameRate: number) => void;
  onCropPositionChange: (position: number) => void;
}

export default function ExportSettings({
  presetId,
  frameRate,
  cropPosition,
  onPresetChange,
  onFrameRateChange,
  onCropPositionChange,
}: ExportSettingsProps) {
  const preset = getExportPreset(presetId);

  return (
    <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-3">
      <label className="text-sm font-medium text-gray-700">
        Export preset
        <select
          aria-label="Export preset"
          value={presetId}
          onChange={(event) => onPresetChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
        >
          {EXPORT_PRESETS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs font-normal text-gray-500">
          {preset.width}×{preset.height} · {preset.platform}
        </span>
      </label>

      <label className="text-sm font-medium text-gray-700">
        Source frame rate
        <select
          aria-label="Source frame rate"
          value={frameRate}
          onChange={(event) => onFrameRateChange(Number(event.target.value))}
          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
        >
          {FRAME_RATE_OPTIONS.map((fps) => (
            <option key={fps} value={fps}>
              {fps} FPS
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs font-normal text-gray-500">
          Used for single-frame seek controls.
        </span>
      </label>

      <label className={`text-sm font-medium text-gray-700 ${preset.cropMode === 'fit' ? 'opacity-50' : ''}`}>
        Horizontal framing: {Math.round(cropPosition)}%
        <input
          aria-label="Horizontal framing"
          type="range"
          min={0}
          max={100}
          step={1}
          value={cropPosition}
          disabled={preset.cropMode === 'fit'}
          onChange={(event) => onCropPositionChange(Number(event.target.value))}
          className="mt-3 w-full"
        />
        <span className="mt-1 block text-xs font-normal text-gray-500">
          {preset.cropMode === 'fit' ? 'Landscape preset preserves the full frame.' : '0% = left, 50% = center, 100% = right.'}
        </span>
      </label>
    </div>
  );
}
