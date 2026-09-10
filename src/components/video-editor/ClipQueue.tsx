'use client';

import type { ClipQueueItem } from './clipQueue';

interface ClipQueueProps {
  clips: ClipQueueItem[];
  disabled?: boolean;
  onAdd: () => void;
  onSelect: (clip: ClipQueueItem) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onExportAll: () => void;
}

const format = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

export default function ClipQueue({ clips, disabled, onAdd, onSelect, onRename, onRemove, onExportAll }: ClipQueueProps) {
  return <section className="rounded-lg border border-gray-200 bg-gray-50 p-4" aria-label="Clip queue">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="font-semibold text-gray-900">Clip queue</h2><p className="mt-1 text-xs text-gray-600">Save several ranges from this source, give them predictable names, then export multiple clips together as one ZIP download.</p></div>
      <button type="button" onClick={onAdd} disabled={disabled} className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:bg-gray-400">Add current range</button>
    </div>
    {clips.length===0?<p className="mt-3 text-sm text-gray-500">No queued clips yet.</p>:<div className="mt-4 space-y-2">{clips.map((clip)=><div key={clip.id} className="grid gap-2 rounded border border-gray-200 bg-white p-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center"><label className="text-xs text-gray-600">Export name<input aria-label={`Name for ${clip.name}`} value={clip.name} onChange={(event)=>onRename(clip.id,event.target.value)} className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm text-gray-900"/></label><span className="text-xs text-gray-500">{format(clip.start)}–{format(clip.end)} · {Math.round(clip.end-clip.start)}s</span><button type="button" onClick={()=>onSelect(clip)} className="rounded bg-gray-200 px-3 py-2 text-xs">Edit range</button><button type="button" onClick={()=>onRemove(clip.id)} className="rounded bg-red-100 px-3 py-2 text-xs text-red-700">Remove</button></div>)}</div>}
    {clips.length>0&&<button type="button" onClick={onExportAll} disabled={disabled} className="mt-4 w-full rounded bg-green-700 px-4 py-3 font-medium text-white disabled:bg-gray-400">{disabled?'Exporting…':clips.length===1?'Export queued clip':`Export all ${clips.length} clips as ZIP`}</button>}
  </section>;
}
