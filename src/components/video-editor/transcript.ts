export interface TranscriptCue { start: number; end: number; text: string; }
export interface ClipSuggestion { start: number; end: number; duration: number; text: string; score: number; }

const timeToSeconds = (value: string): number => {
  const normalized = value.trim().replace(',', '.');
  const parts = normalized.split(':').map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return Number.NaN;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number.NaN;
};

export function parseTranscript(text: string): TranscriptCue[] {
  const blocks = text.replace(/^WEBVTT[^\n]*\n+/i, '').split(/\n\s*\n/);
  const cues: TranscriptCue[] = [];
  for (const rawBlock of blocks) {
    const lines = rawBlock.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const timingIndex = lines.findIndex((line) => line.includes('-->'));
    if (timingIndex < 0) continue;
    const [startRaw, endRawWithSettings] = lines[timingIndex].split('-->').map((part) => part.trim());
    const endRaw = endRawWithSettings?.split(/\s+/)[0] ?? '';
    const start = timeToSeconds(startRaw);
    const end = timeToSeconds(endRaw);
    const cueText = lines.slice(timingIndex + 1).join(' ').replace(/<[^>]+>/g, '').trim();
    if (Number.isFinite(start) && Number.isFinite(end) && end > start && cueText) cues.push({ start, end, text: cueText });
  }
  return cues.sort((a, b) => a.start - b.start);
}

export function suggestClips(cues: TranscriptCue[], videoDuration: number, minSeconds = 30, maxSeconds = 60, limit = 5): ClipSuggestion[] {
  if (!cues.length || videoDuration <= 0) return [];
  const candidates: ClipSuggestion[] = [];
  for (let startIndex = 0; startIndex < cues.length; startIndex += 1) {
    const start = cues[startIndex].start;
    if (start >= videoDuration) break;
    let words = 0;
    let punctuation = 0;
    const text: string[] = [];
    for (let endIndex = startIndex; endIndex < cues.length; endIndex += 1) {
      const cue = cues[endIndex];
      const end = Math.min(videoDuration, cue.end);
      const duration = end - start;
      if (duration > maxSeconds) break;
      text.push(cue.text);
      words += cue.text.split(/\s+/).filter(Boolean).length;
      if (/[.!?]$/.test(cue.text)) punctuation += 1;
      if (duration >= minSeconds) {
        const targetPenalty = Math.abs(45 - duration) * 0.4;
        const score = words + punctuation * 8 - targetPenalty;
        candidates.push({ start, end, duration, text: text.join(' '), score });
      }
    }
  }
  const chosen: ClipSuggestion[] = [];
  for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
    const overlaps = chosen.some((selected) => Math.max(selected.start, candidate.start) < Math.min(selected.end, candidate.end));
    if (!overlaps) chosen.push(candidate);
    if (chosen.length >= limit) break;
  }
  return chosen.sort((a, b) => a.start - b.start);
}

export function getActiveCue(cues: TranscriptCue[], currentTime: number): TranscriptCue | null {
  return cues.find((cue) => currentTime >= cue.start && currentTime < cue.end) ?? null;
}

export function clipTranscript(cues: TranscriptCue[], clipStart: number, clipEnd: number): TranscriptCue[] {
  if (!Number.isFinite(clipStart) || !Number.isFinite(clipEnd) || clipEnd <= clipStart) return [];
  return cues.filter((cue) => cue.end > clipStart && cue.start < clipEnd).map((cue) => ({
    start: Math.max(0, cue.start - clipStart),
    end: Math.min(clipEnd, cue.end) - clipStart,
    text: cue.text,
  })).filter((cue) => cue.end > cue.start);
}

const formatSrtTime = (seconds: number): string => {
  const safe = Math.max(0, seconds);
  const milliseconds = Math.round((safe % 1) * 1000);
  const totalSeconds = Math.floor(safe);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
};

export function serializeSrt(cues: TranscriptCue[]): string {
  return cues.map((cue, index) => `${index + 1}\n${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}\n${cue.text}`).join('\n\n');
}
