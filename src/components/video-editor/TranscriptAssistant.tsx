'use client';

import { useMemo, useState } from 'react';
import { parseTranscript, suggestClips } from './transcript';

interface TranscriptAssistantProps {
  videoDuration: number;
  onSelectClip: (start: number, end: number) => void;
}

const format = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

export default function TranscriptAssistant({ videoDuration, onSelectClip }: TranscriptAssistantProps) {
  const [transcriptText, setTranscriptText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const cues = useMemo(() => parseTranscript(transcriptText), [transcriptText]);
  const suggestions = useMemo(() => suggestClips(cues, videoDuration), [cues, videoDuration]);

  const loadFile = async (file?: File) => {
    if (!file) return;
    if (!/\.(srt|vtt)$/i.test(file.name)) return;
    setFileName(file.name);
    setTranscriptText(await file.text());
  };

  return <section className="rounded-lg border border-indigo-200 bg-indigo-50 p-4" aria-label="Assisted clip discovery">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-indigo-950">Assisted clip discovery</h2><p className="mt-1 text-xs text-indigo-800">Import an SRT or VTT transcript. Analysis stays in your browser and suggests 30–60 second candidate clips for review.</p></div><label className="cursor-pointer rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Import transcript<input aria-label="Import transcript" type="file" accept=".srt,.vtt,text/vtt,application/x-subrip" className="sr-only" onChange={(event)=>void loadFile(event.target.files?.[0])}/></label></div>
    {fileName&&<p className="mt-3 text-xs text-indigo-700">Loaded {fileName} · {cues.length} caption cues</p>}
    {fileName&&cues.length===0&&<p className="mt-3 text-sm text-red-700">No timed captions were found. Use a standard SRT or WebVTT transcript with timestamps.</p>}
    {suggestions.length>0&&<div className="mt-4 grid gap-3 md:grid-cols-2">{suggestions.map((clip,index)=><article key={`${clip.start}-${clip.end}`} className="rounded border border-indigo-200 bg-white p-3"><div className="flex items-center justify-between gap-2"><strong className="text-sm text-gray-900">Candidate {index+1}</strong><span className="text-xs text-gray-500">{format(clip.start)}–{format(clip.end)} · {Math.round(clip.duration)}s</span></div><p className="mt-2 line-clamp-3 text-xs text-gray-600">{clip.text}</p><button type="button" onClick={()=>onSelectClip(clip.start,clip.end)} className="mt-3 rounded bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700">Use this clip</button></article>)}</div>}
  </section>;
}
