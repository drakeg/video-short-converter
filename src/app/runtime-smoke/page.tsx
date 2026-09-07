'use client';

import { useState } from 'react';
import { validateCaptionBurnInSupport } from '@/utils/videoProcessor';

export default function RuntimeSmokePage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');
  const [message, setMessage] = useState('');

  async function runSmokeTest() {
    setStatus('running');
    setMessage('');
    try {
      await validateCaptionBurnInSupport();
      setStatus('passed');
    } catch (error) {
      setStatus('failed');
      setMessage(error instanceof Error ? error.message : 'Caption runtime validation failed.');
    }
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">Caption runtime diagnostic</h1>
      <p className="mt-3 text-sm text-gray-600">Runs the same browser-local FFmpeg caption smoke gate used before burned-in caption exports.</p>
      <button className="mt-6 rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={status === 'running'} onClick={runSmokeTest} type="button">
        {status === 'running' ? 'Running…' : 'Run caption runtime check'}
      </button>
      <p className="mt-4" data-testid="runtime-status">{status}</p>
      {message ? <p className="mt-2 text-sm" data-testid="runtime-message">{message}</p> : null}
    </main>
  );
}
