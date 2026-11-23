'use client';

import { useMemo, useState } from 'react';
import { calculateRealtimeFactor, resolveLocalTranscriptionCapability } from '@/components/video-editor/localTranscriptionPrototype';
import { runLocalTranscriptionHarness } from '@/components/video-editor/localTranscriptionHarness';
import { parseBenchmarkEvidence, validateBenchmarkEvidenceFiles, type ReviewedBenchmark } from '@/components/video-editor/benchmarkEvidenceReview';
import { assessTranscriptionBenchmarkEvidence, buildTranscriptionBenchmarkEvidence, type TranscriptionBenchmarkEvidence } from '@/components/video-editor/transcriptionBenchmarkEvidence';

type Result = Awaited<ReturnType<typeof runLocalTranscriptionHarness>>;

export default function TranscriptionBenchmarkPage() {
  const capability = useMemo(() => resolveLocalTranscriptionCapability(
    process.env.NEXT_PUBLIC_LOCAL_TRANSCRIPTION_PROTOTYPE,
    typeof navigator === 'undefined' ? undefined : navigator,
  ), []);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'passed' | 'warning' | 'failed'>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [evidence, setEvidence] = useState<TranscriptionBenchmarkEvidence | null>(null);
  const [reviewed, setReviewed] = useState<ReviewedBenchmark[]>([]);
  const [reviewError, setReviewError] = useState('');

  async function run() {
    if (!file) { setStatus('failed'); setMessage('Choose a local video file.'); return; }
    // Capture the exact input for this run; selection changes must never relabel its evidence.
    const source = file;
    setStatus('running'); setMessage(''); setResult(null); setEvidence(null);
    try {
      const next = await runLocalTranscriptionHarness(source, capability);
      const completedEvidence = buildTranscriptionBenchmarkEvidence(source, next, capability, navigator.userAgent);
      setEvidence(completedEvidence);
      setResult(next);
      setStatus(assessTranscriptionBenchmarkEvidence(completedEvidence).length ? 'warning' : 'passed');
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

  async function importEvidence(files: File[]) {
    if (!files.length) return;
    setReviewError('');
    const validationError = validateBenchmarkEvidenceFiles(files);
    if (validationError) { setReviewError(validationError); return; }
    try {
      const items: ReviewedBenchmark[] = [];
      for (const selected of files) {
        try { items.push(parseBenchmarkEvidence(await selected.text())); }
        catch (error) { throw new Error(`${selected.name}: ${error instanceof Error ? error.message : 'Invalid evidence.'}`); }
      }
      setReviewed(items);
    } catch (error) {
      setReviewed([]);
      setReviewError(error instanceof Error ? error.message : 'Unable to review evidence.');
    }
  }

  return <main className="mx-auto max-w-2xl p-8">
    <h1 className="text-2xl font-semibold">Local transcription benchmark</h1>
    <p className="mt-3 text-sm">Developer-only diagnostic. Source media stays in this browser; model/runtime assets may be fetched from their configured origin.</p>
    <p className="mt-3" data-testid="benchmark-capability">{capability.reason}</p>
    <label className="mt-5 block">Local video<input className="mt-1 block" type="file" accept="video/*" disabled={status === 'running'} onChange={(e) => { setFile(e.target.files?.[0] ?? null); setResult(null); setEvidence(null); setStatus('idle'); setMessage(''); }} /></label>
    <button className="mt-5 rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={!capability.enabled || status === 'running'} onClick={run} type="button">{status === 'running' ? 'Running…' : 'Run local benchmark'}</button>
    <p className="mt-4" data-testid="benchmark-status">{status}</p>
    {message ? <p data-testid="benchmark-message">{message}</p> : null}
    {evidence && assessTranscriptionBenchmarkEvidence(evidence).length > 0 ? <section role="alert" data-testid="benchmark-evidence-warnings" className="mt-4 rounded border border-amber-500 p-3"><p>Benchmark completed with warnings — evidence is downloadable for investigation, but must not be used to establish performance thresholds:</p><ul className="list-disc pl-5">{assessTranscriptionBenchmarkEvidence(evidence).map((warning) => <li key={warning}>{warning}</li>)}</ul></section> : null}
    {result ? <section className="mt-5">
      <p>Measured audio duration: {result.benchmark.sourceDurationSeconds.toFixed(2)} seconds</p>
      <p>Provider: {result.benchmark.executionProvider}</p>
      <p>Cold load: {result.benchmark.coldLoadMs.toFixed(0)} ms</p>
      <p>Transcription: {result.benchmark.transcriptionMs.toFixed(0)} ms</p>
      <p>Realtime factor: {calculateRealtimeFactor(result.benchmark)?.toFixed(2) ?? 'n/a'}</p>
      <p>Cues: {result.benchmark.cueCount}</p>
      <button className="mt-3 underline" onClick={downloadEvidence} disabled={!evidence} type="button">Download benchmark evidence</button>
    </section> : null}
    <section className="mt-8 border-t pt-5" aria-label="Review saved benchmark evidence">
      <h2 className="text-lg font-semibold">Review saved benchmark evidence</h2>
      <p className="mt-2 text-sm">Choose up to ten previously downloaded benchmark JSON files to compare measured duration, provider, and realtime factor locally. Imported files are not uploaded. Quality warnings remain visible.</p>
      <label className="mt-3 block">Benchmark JSON files<input className="mt-1 block" type="file" accept=".json,application/json" multiple onChange={(event) => { const files = Array.from(event.currentTarget.files ?? []); event.currentTarget.value = ''; void importEvidence(files); }} /></label>
      {reviewError ? <p role="alert" className="mt-2 text-red-700">{reviewError}</p> : null}
      {reviewed.length ? <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th scope="col">Source</th><th scope="col">Provider</th><th scope="col">Audio (s)</th><th scope="col">Realtime factor</th><th scope="col">Quality</th></tr></thead><tbody>{reviewed.map((item, index) => <tr key={`${item.evidence.capturedAt}-${index}`}><td className="py-2 pr-2">{item.evidence.source.name}</td><td className="pr-2">{item.evidence.benchmark.executionProvider}</td><td className="pr-2">{item.evidence.benchmark.sourceDurationSeconds.toFixed(2)}</td><td className="pr-2">{item.evidence.realtimeFactor?.toFixed(2) ?? 'n/a'}</td><td>{item.warnings.length ? `Warning: ${item.warnings.join(' ')}` : 'Checks passed'}</td></tr>)}</tbody></table></div> : null}
    </section>
  </main>;
}
