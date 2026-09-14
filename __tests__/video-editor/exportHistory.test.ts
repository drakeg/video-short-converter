import { appendExportHistory, buildExportHistoryEntry, createExportHistoryManifestFile, parseExportHistory, restoreClipQueueFromHistory } from '@/components/video-editor/exportHistory';
import type { ClipQueueItem } from '@/components/video-editor/clipQueue';

const capturedSettings = {
  presetId: 'youtube-shorts',
  cropPosition: 50,
  cropPositionY: 50,
  quality: 'high' as const,
  frameRate: 30,
  muted: false,
  gainDb: 0,
  normalize: true,
  fadeIn: 0,
  fadeOut: 0,
  captionStyle: { size: 'medium' as const, position: 'bottom' as const, backdrop: true },
  burnCaptions: false,
};

const clips: ClipQueueItem[] = [
  { id: 'one', name: 'intro', start: 0, end: 30, settings: capturedSettings },
  { id: 'two', name: 'outro', start: 30, end: 60 },
];

const source = { name: 'source.mov', size: 123456, lastModified: 1720000000000 };

describe('export history', () => {
  it('summarizes outcomes and stores a metadata-only manifest snapshot', () => {
    const entry = buildExportHistoryEntry(clips, [new File(['video-bytes'], 'intro.mp4')], [{ clip: clips[1], message: 'encoder failed' }], new Date('2026-09-13T20:00:00.000Z'));
    expect(entry).toMatchObject({ id: '2026-09-13T20:00:00.000Z:one,two', exportedAt: '2026-09-13T20:00:00.000Z', clipCount: 2, successCount: 1, failureCount: 1, successfulFiles: ['intro.mp4'], failedClips: [{ name: 'outro', message: 'encoder failed' }] });
    expect(entry.manifest).toEqual({ schemaVersion: 1, exportedAt: '2026-09-13T20:00:00.000Z', clips: [
      { id: 'one', name: 'intro', start: 0, end: 30, duration: 30, status: 'exported', outputFile: 'intro.mp4', settingsCaptured: true, settings: capturedSettings },
      { id: 'two', name: 'outro', start: 30, end: 60, duration: 30, status: 'failed', error: 'encoder failed', settingsCaptured: false },
    ] });
    expect(JSON.stringify(entry)).not.toContain('video-bytes');
  });

  it('uses schema version 2 when a source fingerprint is available', () => {
    const entry = buildExportHistoryEntry(clips, [new File(['x'], 'intro.mp4')], [{ clip: clips[1], message: 'failed' }], new Date('2026-09-13T20:00:00.000Z'), source);
    expect(entry.manifest).toMatchObject({ schemaVersion: 2, source });
    const roundTrip = parseExportHistory(JSON.stringify([entry]));
    expect(roundTrip[0].manifest?.source).toEqual(source);
  });

  it('rejects schema version 2 manifests without a valid source fingerprint', () => {
    const entry = buildExportHistoryEntry(clips, [new File(['x'], 'intro.mp4')], [], new Date('2026-09-13T20:00:00.000Z'), source);
    const malformed = { ...entry, manifest: { ...entry.manifest, source: { name: 'source.mov', size: 'bad', lastModified: 1 } } };
    expect(parseExportHistory(JSON.stringify([malformed]))).toEqual([]);
  });

  it('restores queue ranges, names, and captured settings without reusing historical IDs', () => {
    const entry = buildExportHistoryEntry(clips, [new File(['x'], 'intro.mp4')], [{ clip: clips[1], message: 'failed' }], new Date('2026-09-13T20:00:00.000Z'));
    const restored = restoreClipQueueFromHistory(entry);
    expect(restored?.map(({ name, start, end }) => ({ name, start, end }))).toEqual([{ name: 'intro', start: 0, end: 30 }, { name: 'outro', start: 30, end: 60 }]);
    expect(restored?.[0].id).not.toBe('one');
    expect(restored?.[0].settings).toEqual(capturedSettings);
    expect(restored?.[0].settings?.captionStyle).not.toBe(entry.manifest?.clips[0].settings?.captionStyle);
    expect(restored?.[1].settings).toBeUndefined();
    expect(restoreClipQueueFromHistory({ ...entry, manifest: undefined })).toBeNull();
  });

  it('creates a downloadable JSON file only for entries with retained manifests', () => {
    const entry = buildExportHistoryEntry(clips, [new File(['x'], 'intro.mp4')], [{ clip: clips[1], message: 'failed' }]);
    const file = createExportHistoryManifestFile(entry);
    expect(file?.name).toBe('export-history-manifest.json');
    expect(file?.type).toBe('application/json');
    expect(createExportHistoryManifestFile({ ...entry, manifest: undefined })).toBeNull();
  });

  it('keeps older valid history entries that predate retained manifests', () => {
    const legacy = [{ id: 'old', exportedAt: '2026-09-01T00:00:00.000Z', clipCount: 1, successCount: 1, failureCount: 0, successfulFiles: ['old.mp4'], failedClips: [] }];
    expect(parseExportHistory(JSON.stringify(legacy))).toEqual(legacy);
  });

  it('keeps only the ten most recent entries', () => {
    let entries = [] as ReturnType<typeof parseExportHistory>;
    for (let index = 0; index < 12; index++) entries = appendExportHistory(entries, { id: String(index), exportedAt: new Date(index * 1000).toISOString(), clipCount: 1, successCount: 1, failureCount: 0, successfulFiles: [`${index}.mp4`], failedClips: [] });
    expect(entries).toHaveLength(10);
    expect(entries[0].id).toBe('11');
    expect(entries.at(-1)?.id).toBe('2');
  });

  it('rejects malformed persisted history safely', () => {
    expect(parseExportHistory('not json')).toEqual([]);
    expect(parseExportHistory(JSON.stringify([{ id: 1 }]))).toEqual([]);
  });
});
