'use client';

import { getActiveCue, type TranscriptCue } from './transcript';

export type CaptionSize = 'small' | 'medium' | 'large';
export type CaptionPosition = 'top' | 'middle' | 'bottom';
export interface CaptionStyle { size: CaptionSize; position: CaptionPosition; backdrop: boolean; }

const sizeClass: Record<CaptionSize, string> = { small: 'text-sm md:text-base', medium: 'text-base md:text-xl', large: 'text-xl md:text-3xl' };
const positionClass: Record<CaptionPosition, string> = { top: 'items-start pt-6', middle: 'items-center', bottom: 'items-end pb-8' };

export default function CaptionOverlay({ cues, currentTime, style }: { cues: TranscriptCue[]; currentTime: number; style: CaptionStyle }) {
  const cue = getActiveCue(cues, currentTime);
  if (!cue) return null;
  return <div className={`pointer-events-none absolute inset-0 z-20 flex justify-center px-6 text-center ${positionClass[style.position]}`} aria-live="off">
    <span className={`max-w-[90%] rounded px-2 py-1 font-semibold leading-snug text-white drop-shadow-lg ${sizeClass[style.size]} ${style.backdrop ? 'bg-black/70' : ''}`}>{cue.text}</span>
  </div>;
}
