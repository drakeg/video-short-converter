'use client';

import { EXPORT_PRESETS, FRAME_RATE_OPTIONS, getExportPreset, type ExportQuality } from './editorConfig';

interface ExportSettingsProps {
  presetId: string;
  frameRate: number;
  cropPosition: number;
  cropPositionY: number;
  quality: ExportQuality;
  onPresetChange: (presetId: string) => void;
  onFrameRateChange: (frameRate: number) => void;
  onCropPositionChange: (position: number) => void;
  onCropPositionYChange: (position: number) => void;
  onQualityChange: (quality: ExportQuality) => void;
}

export default function ExportSettings({ presetId, frameRate, cropPosition, cropPositionY, quality, onPresetChange, onFrameRateChange, onCropPositionChange, onCropPositionYChange, onQualityChange }: ExportSettingsProps) {
  const preset = getExportPreset(presetId);

  return (
    <div className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2 lg:grid-cols-5">
      <label className="text-sm font-medium text-gray-700">Export preset
        <select aria-label="Export preset" value={presetId} onChange={(event) => onPresetChange(event.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2">
          {EXPORT_PRESETS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
        <span className="mt-1 block text-xs font-normal text-gray-500">{preset.width}×{preset.height} · {preset.platform}</span>
      </label>

      <label className="text-sm font-medium text-gray-700">Export quality
        <select aria-label="Export quality" value={quality} onChange={(event) => onQualityChange(event.target.value as ExportQuality)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2">
          <option value="standard">Standard</option><option value="high">High</option><option value="maximum">Maximum</option>
        </select>
        <span className="mt-1 block text-xs font-normal text-gray-500">Higher quality produces larger files.</span>
      </label>

      <label className="text-sm font-medium text-gray-700">Source frame rate
        <select aria-label="Source frame rate" value={frameRate} onChange={(event) => onFrameRateChange(Number(event.target.value))} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2">
          {FRAME_RATE_OPTIONS.map((fps) => <option key={fps} value={fps}>{fps} FPS</option>)}
        </select>
        <span className="mt-1 block text-xs font-normal text-gray-500">Used for single-frame seek controls.</span>
      </label>

      <label className={`text-sm font-medium text-gray-700 ${preset.cropMode === 'fit' ? 'opacity-50' : ''}`}>Horizontal framing: {Math.round(cropPosition)}%
        <input aria-label="Horizontal framing" type="range" min={0} max={100} step={1} value={cropPosition} disabled={preset.cropMode === 'fit'} onChange={(event) => onCropPositionChange(Number(event.target.value))} className="mt-3 w-full" />
        <span className="mt-1 block text-xs font-normal text-gray-500">0% = left, 50% = center, 100% = right.</span>
      </label>

      <label className={`text-sm font-medium text-gray-700 ${preset.cropMode === 'fit' ? 'opacity-50' : ''}`}>Vertical framing: {Math.round(cropPositionY)}%
        <input aria-label="Vertical framing" type="range" min={0} max={100} step={1} value={cropPositionY} disabled={preset.cropMode === 'fit'} onChange={(event) => onCropPositionYChange(Number(event.target.value))} className="mt-3 w-full" />
        <span className="mt-1 block text-xs font-normal text-gray-500">0% = top, 50% = center, 100% = bottom.</span>
      </label>
    </div>
  );
}
