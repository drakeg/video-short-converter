'use client';

import { useMemo, useState } from 'react';
import { calculateRealtimeFactor, resolveLocalTranscriptionCapability } from '@/components/video-editor/localTranscriptionPrototype';
import { runLocalTranscriptionHarness } from '@/components/video-editor/localTranscriptionHarness';
import { buildTranscriptionBenchmarkEvidence, type TranscriptionBenchmarkEvidence } from '@/components/video-editor/transcriptionBenchmarkEvidence';

type Result = Awaited<ReturnType<typeof runLocalTranscriptionHarness>>;

export default function TranscriptionBenchmarkPage() {
  const capability = useMemo(() => resolveLocalTranscriptionCapability(
    process.env.NEXT_PUBLIC_LOCAL_TRANSCRIPTION_PROTOTYPE,
    typeof navigator === 'undefined' ? undefined : navigator,
  ), []);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [evidence, setEvidence] = useState<TranscriptionBenchmarkEvidence | null>(null);

  async function run() {
    if (!file) { setStatus('failed'); setMessage('Choose a local video file.'); return; }
    // Capture the exact input for this run; selection changes must never relabel its evidence.
    const source = file;
    setStatus('running'); setMessage(''); setResult(null); setEvidence(null);
    try {
      const next = await runLocalTranscriptionHarness(source, capability);
      setEvidence(buildTranscriptionBenchmarkEvidence(source, next, capability, navigator.userAgent));
      setResult(next); setStatus('passed');
    } catch (error) {
      setStatus('failed'); setMessage(error instanceof Error ? error.message : 'Local transcription benchmark failed.');
    }
  }

  function downloadEvidence() {
    if (!evidence) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'local-transcription-benchmark.json'; anchor.click();
    URL.revokeObjectURL(url);
  }

  return <main className="mx-auto max-w-2xl p-8">
    <h1 className="text-2xl font-semibold">Local transcription benchmark</h1>
    <p className="mt-3 text-sm">Developer-only diagnostic. Source media stays in this browser; model/runtime assets may be fetched from their configured origin.</p>
    <p className="mt-3" data-testid="benchmark-capability">{capability.reason}</p>
    <label className="mt-5 block">Local video<input className="mt-1 block" type="file" accept="video/*" disabled={status === 'running'} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setEvidence(null); setStatus('idle'); setMessage(''); }} /></label>
    <button className="mt-5 rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={!capability.enabled || status === 'running'} onClick={run} type="button">{status === 'running' ? 'Running…' : 'Run local benchmark'}</button>
    <p className="mt-4" data-testid="benchmark-status">{status}</p>
    {message ? <p data-testid="benchmark-message">{message}</p> : null}
    {result ? <section className="mt-5">
      <p>Measured audio duration: {result.benchmark.sourceDurationSeconds.toFixed(2)} seconds</p>
      <p>Provider: {result.benchmark.executionProvider}</p>
      <p>Cold load: {result.benchmark.coldLoadMs.toFixed(0)} ms</p>
      <p>Transcription: {result.benchmark.transcriptionMs.toFixed(0)} ms</p>
      <p>Realtime factor: {calculateRealtimeFactor(result.benchmark)?.toFixed(2) ?? 'n/a'}</p>
      <p>Cues: {result.benchmark.cueCount}</p>
      <button className="mt-3 underline" onClick={downloadEvidence} disabled={!evidence} type="button">Download benchmark evidence</button>
    </section> : null}
  </main>;
}
