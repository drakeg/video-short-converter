'use client';

import { useMemo, useRef } from 'react';
import type { ExportPreset } from './editorConfig';
import { clampCropPosition } from './editorConfig';

interface FramingOverlayProps {
  sourceWidth: number;
  sourceHeight: number;
  preset: ExportPreset;
  cropPosition: number;
  onCropPositionChange: (position: number) => void;
}

export default function FramingOverlay({
  sourceWidth,
  sourceHeight,
  preset,
  cropPosition,
  onCropPositionChange,
}: FramingOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const overlay = useMemo(() => {
    if (!sourceWidth || !sourceHeight || preset.cropMode === 'fit') {
      return { widthPercent: 100, leftPercent: 0, movable: false };
    }

    const sourceRatio = sourceWidth / sourceHeight;
    const targetRatio = preset.width / preset.height;

    if (sourceRatio <= targetRatio) {
      return { widthPercent: 100, leftPercent: 0, movable: false };
    }

    const widthPercent = Math.min(100, (targetRatio / sourceRatio) * 100);
    const remaining = 100 - widthPercent;
    const leftPercent = remaining * (clampCropPosition(cropPosition) / 100);

    return { widthPercent, leftPercent, movable: remaining > 0.01 };
  }, [sourceWidth, sourceHeight, preset, cropPosition]);

  const updateFromClientX = (clientX: number) => {
    if (!overlay.movable || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const overlayWidth = rect.width * (overlay.widthPercent / 100);
    const movablePixels = Math.max(1, rect.width - overlayWidth);
    const desiredLeft = clientX - rect.left - overlayWidth / 2;
    onCropPositionChange(clampCropPosition((desiredLeft / movablePixels) * 100));
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute inset-0 z-10"
      onPointerDown={(event) => {
        if (!overlay.movable) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        updateFromClientX(event.clientX);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          updateFromClientX(event.clientX);
        }
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      aria-label="Framing preview"
    >
      {preset.cropMode === 'crop' && (
        <>
          <div
            className="absolute inset-y-0 border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
            style={{
              width: `${overlay.widthPercent}%`,
              left: `${overlay.leftPercent}%`,
              cursor: overlay.movable ? 'ew-resize' : 'default',
            }}
          />
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {overlay.movable ? 'Drag to reframe' : 'Vertical crop is centered'}
          </div>
        </>
      )}
    </div>
  );
}
