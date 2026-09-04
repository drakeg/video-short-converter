import type { CaptionStyle } from './CaptionOverlay';
import type { TranscriptCue } from './transcript';

export interface CaptionOverlayAsset {
  cue: TranscriptCue;
  fileName: string;
  bytes: Uint8Array;
}

export interface CaptionOverlayFilterPlan {
  filter: string;
  outputLabel: string;
}

const FONT_SCALE: Record<CaptionStyle['size'], number> = {
  small: 0.038,
  medium: 0.05,
  large: 0.064,
};

export function getCaptionFontSize(style: CaptionStyle, height: number): number {
  return Math.max(24, Math.round(Math.max(1, height) * FONT_SCALE[style.size]));
}

export function buildCaptionOverlayFilter(videoFilter: string, cues: TranscriptCue[]): CaptionOverlayFilterPlan {
  if (!cues.length) return { filter: videoFilter, outputLabel: '' };
  const parts = [`[0:v]${videoFilter},setpts=PTS-STARTPTS[v0]`];
  cues.forEach((cue, index) => {
    const inputIndex = index + 1;
    parts.push(`[${inputIndex}:v]format=rgba,setpts=PTS-STARTPTS[cap${index}]`);
    parts.push(`[v${index}][cap${index}]overlay=0:0:enable='between(t,${cue.start.toFixed(3)},${cue.end.toFixed(3)})'[v${index + 1}]`);
  });
  return { filter: parts.join(';'), outputLabel: `[v${cues.length}]` };
}

function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let current = words[0];
  for (const word of words.slice(1)) {
    const candidate = `${current} ${word}`;
    if (context.measureText(candidate).width <= maxWidth) current = candidate;
    else { lines.push(current); current = word; }
  }
  lines.push(current);
  return lines;
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) { reject(new Error('Unable to render caption overlay.')); return; }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, 'image/png');
  });
}

export async function renderCaptionOverlay(cue: TranscriptCue, style: CaptionStyle, width: number, height: number, index: number): Promise<CaptionOverlayAsset> {
  if (typeof document === 'undefined') throw new Error('Caption rendering is only available in the browser.');
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser cannot create caption overlays.');

  const fontSize = getCaptionFontSize(style, height);
  const lineHeight = Math.round(fontSize * 1.22);
  const maxTextWidth = width * 0.84;
  context.font = `600 ${fontSize}px Arial, Helvetica, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  const lines = wrapLines(context, cue.text, maxTextWidth);
  if (!lines.length) return { cue, fileName: `caption-${index}.png`, bytes: await canvasToPng(canvas) };

  const widest = Math.max(...lines.map((line) => context.measureText(line).width));
  const paddingX = Math.round(fontSize * 0.45);
  const paddingY = Math.round(fontSize * 0.28);
  const blockWidth = Math.min(width * 0.94, widest + paddingX * 2);
  const blockHeight = lines.length * lineHeight + paddingY * 2;
  const margin = Math.round(height * 0.065);
  const centerY = style.position === 'top' ? margin + blockHeight / 2 : style.position === 'middle' ? height / 2 : height - margin - blockHeight / 2;
  const left = (width - blockWidth) / 2;
  const top = centerY - blockHeight / 2;

  if (style.backdrop) {
    const radius = Math.max(8, Math.round(fontSize * 0.18));
    context.fillStyle = 'rgba(0, 0, 0, 0.72)';
    context.beginPath();
    context.roundRect(left, top, blockWidth, blockHeight, radius);
    context.fill();
  }

  context.fillStyle = '#ffffff';
  context.shadowColor = 'rgba(0, 0, 0, 0.85)';
  context.shadowBlur = Math.max(3, Math.round(fontSize * 0.08));
  context.shadowOffsetY = Math.max(2, Math.round(fontSize * 0.04));
  const firstLineY = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, lineIndex) => context.fillText(line, width / 2, firstLineY + lineIndex * lineHeight));

  return { cue, fileName: `caption-${index}.png`, bytes: await canvasToPng(canvas) };
}
