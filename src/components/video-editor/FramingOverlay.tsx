'use client';

import { useMemo, useRef } from 'react';
import type { ExportPreset } from './editorConfig';
import { clampCropPosition } from './editorConfig';

interface FramingOverlayProps {
  sourceWidth: number;
  sourceHeight: number;
  preset: ExportPreset;
  cropPosition: number;
  cropPositionY: number;
  onCropPositionChange: (position: number) => void;
  onCropPositionYChange: (position: number) => void;
}

export default function FramingOverlay({ sourceWidth, sourceHeight, preset, cropPosition, cropPositionY, onCropPositionChange, onCropPositionYChange }: FramingOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const overlay = useMemo(() => {
    if (!sourceWidth || !sourceHeight || preset.cropMode === 'fit') return { widthPercent: 100, heightPercent: 100, leftPercent: 0, topPercent: 0, horizontal: false, vertical: false };
    const sourceRatio = sourceWidth / sourceHeight;
    const targetRatio = preset.width / preset.height;
    if (sourceRatio > targetRatio) {
      const widthPercent = Math.min(100, (targetRatio / sourceRatio) * 100);
      const remaining = 100 - widthPercent;
      return { widthPercent, heightPercent: 100, leftPercent: remaining * (clampCropPosition(cropPosition) / 100), topPercent: 0, horizontal: remaining > .01, vertical: false };
    }
    if (sourceRatio < targetRatio) {
      const heightPercent = Math.min(100, (sourceRatio / targetRatio) * 100);
      const remaining = 100 - heightPercent;
      return { widthPercent: 100, heightPercent, leftPercent: 0, topPercent: remaining * (clampCropPosition(cropPositionY) / 100), horizontal: false, vertical: remaining > .01 };
    }
    return { widthPercent: 100, heightPercent: 100, leftPercent: 0, topPercent: 0, horizontal: false, vertical: false };
  }, [sourceWidth, sourceHeight, preset, cropPosition, cropPositionY]);

  const updateFromPointer = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (overlay.horizontal) {
      const overlayWidth = rect.width * (overlay.widthPercent / 100);
      const movable = Math.max(1, rect.width - overlayWidth);
      onCropPositionChange(clampCropPosition(((clientX - rect.left - overlayWidth / 2) / movable) * 100));
    }
    if (overlay.vertical) {
      const overlayHeight = rect.height * (overlay.heightPercent / 100);
      const movable = Math.max(1, rect.height - overlayHeight);
      onCropPositionYChange(clampCropPosition(((clientY - rect.top - overlayHeight / 2) / movable) * 100));
    }
  };

  const movable = overlay.horizontal || overlay.vertical;
  return <div ref={containerRef} className="pointer-events-auto absolute inset-0 z-10" onPointerDown={(event) => { if (!movable) return; event.currentTarget.setPointerCapture(event.pointerId); updateFromPointer(event.clientX, event.clientY); }} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event.clientX, event.clientY); }} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} aria-label="Framing preview">
    {preset.cropMode === 'crop' && <><div className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" style={{ width: `${overlay.widthPercent}%`, height: `${overlay.heightPercent}%`, left: `${overlay.leftPercent}%`, top: `${overlay.topPercent}%`, cursor: overlay.horizontal ? 'ew-resize' : overlay.vertical ? 'ns-resize' : 'default' }} /><div className="absolute left-1/2 top-3 -translate-x-1/2 rounded bg-black/70 px-2 py-1 text-xs text-white">{movable ? `Drag to reframe ${overlay.vertical ? 'vertically' : 'horizontally'}` : 'Full frame matches crop ratio'}</div></>}
  </div>;
}
