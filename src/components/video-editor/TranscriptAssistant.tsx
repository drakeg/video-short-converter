'use client';

import { useMemo, useState } from 'react';
import type { CaptionStyle } from './CaptionOverlay';
import { clipTranscript, parseTranscript, serializeSrt, suggestClips, type TranscriptCue } from './transcript';

interface TranscriptAssistantProps {
  videoDuration: number;
  clipStart: number | null;
  clipEnd: number | null;
  captionStyle: CaptionStyle;
  onCaptionStyleChange: (style: CaptionStyle) => void;
  onTranscriptChange: (cues: TranscriptCue[]) => void;
  onSelectClip: (start: number, end: number) => void;
}

const format = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

export default function TranscriptAssistant({ videoDuration, clipStart, clipEnd, captionStyle, onCaptionStyleChange, onTranscriptChange, onSelectClip }: TranscriptAssistantProps) {
  const [transcriptText, setTranscriptText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const cues = useMemo(() => parseTranscript(transcriptText), [transcriptText]);
  const suggestions = useMemo(() => suggestClips(cues, videoDuration), [cues, videoDuration]);
  const clipCues = useMemo(() => clipStart !== null && clipEnd !== null ? clipTranscript(cues, clipStart, clipEnd) : [], [cues, clipStart, clipEnd]);

  const loadFile = async (file?: File) => {
    if (!file || !/\.(srt|vtt)$/i.test(file.name)) return;
    const text = await file.text();
    const nextCues = parseTranscript(text);
    setFileName(file.name);
    setTranscriptText(text);
    onTranscriptChange(nextCues);
  };

  const downloadClipCaptions = () => {
    if (!clipCues.length) return;
    const blob = new Blob([serializeSrt(clipCues)], { type: 'application/x-subrip;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `captions-${Math.round((clipStart ?? 0) * 100) / 100}-${Math.round((clipEnd ?? 0) * 100) / 100}.srt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4" aria-label="Assisted clip discovery">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-indigo-950">Transcript & captions</h2><p className="mt-1 text-xs text-indigo-800">Import SRT or VTT locally for clip suggestions, live caption preview, and a trimmed SRT sidecar export.</p></div><label className="cursor-pointer rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Import transcript<input aria-label="Import transcript" type="file" accept=".srt,.vtt,text/vtt,application/x-subrip" className="sr-only" onChange={(event)=>void loadFile(event.target.files?.[0])}/></label></div>
    {fileName&&<p className="mt-3 text-xs text-indigo-700">Loaded {fileName} · {cues.length} caption cues</p>}
    {fileName&&cues.length===0&&<p className="mt-3 text-sm text-red-700">No timed captions were found. Use a standard SRT or WebVTT transcript with timestamps.</p>}
    {cues.length>0&&<div className="mt-4 grid gap-3 rounded border border-indigo-200 bg-white p-3 md:grid-cols-4"><label className="text-xs font-medium text-gray-700">Caption size<select aria-label="Caption size" value={captionStyle.size} onChange={(event)=>onCaptionStyleChange({...captionStyle,size:event.target.value as CaptionStyle['size']})} className="mt-1 w-full rounded border border-gray-300 px-2 py-1"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label><label className="text-xs font-medium text-gray-700">Position<select aria-label="Caption position" value={captionStyle.position} onChange={(event)=>onCaptionStyleChange({...captionStyle,position:event.target.value as CaptionStyle['position']})} className="mt-1 w-full rounded border border-gray-300 px-2 py-1"><option value="top">Top</option><option value="middle">Middle</option><option value="bottom">Bottom</option></select></label><label className="flex items-center gap-2 text-xs font-medium text-gray-700"><input type="checkbox" checked={captionStyle.backdrop} onChange={(event)=>onCaptionStyleChange({...captionStyle,backdrop:event.target.checked})}/> Dark caption backdrop</label><button type="button" onClick={downloadClipCaptions} disabled={!clipCues.length} className="rounded bg-indigo-600 px-3 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400">Download clip SRT ({clipCues.length})</button></div>}
    {suggestions.length>0&&<div className="mt-4 grid gap-3 md:grid-cols-2">{suggestions.map((clip,index)=><article key={`${clip.start}-${clip.end}`} className="rounded border border-indigo-200 bg-white p-3"><div className="flex items-center justify-between gap-2"><strong className="text-sm text-gray-900">Candidate {index+1}</strong><span className="text-xs text-gray-500">{format(clip.start)}–{format(clip.end)} · {Math.round(clip.duration)}s</span></div><p className="mt-2 line-clamp-3 text-xs text-gray-600">{clip.text}</p><button type="button" onClick={()=>onSelectClip(clip.start,clip.end)} className="mt-3 rounded bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700">Use this clip</button></article>)}</div>}
  </section>;
}
