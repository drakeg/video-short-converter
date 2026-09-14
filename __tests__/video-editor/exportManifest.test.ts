import { buildBatchExportManifest, createBatchExportManifestFile } from '@/components/video-editor/exportManifest';
import type { ClipQueueItem } from '@/components/video-editor/clipQueue';

const capturedSettings = {
  presetId: 'youtube-shorts',
  cropPosition: 42,
  cropPositionY: 55,
  quality: 'high' as const,
  frameRate: 30,
  muted: false,
  gainDb: 2,
  normalize: true,
  fadeIn: 0.25,
  fadeOut: 0.5,
  captionStyle: { size: 'medium' as const, position: 'bottom' as const, backdrop: true },
  burnCaptions: true,
};

const clips: ClipQueueItem[] = [
  { id: 'one', name: 'intro', start: 2, end: 32, settings: capturedSettings },
  { id: 'two', name: 'outro', start: 40, end: 65 },
];

describe('batch export manifest', () => {
  it('records outputs, failures, and saved settings provenance in queue order', () => {
    const file = new File(['video'], 'source-intro.mp4', { type: 'video/mp4' });
    const manifest = buildBatchExportManifest({
      sourceFile: 'source.mov',
      clips,
      files: [file],
      failures: [{ clip: clips[1], message: 'FFmpeg failed.' }],
      exportedAt: new Date('2026-09-12T04:00:00.000Z'),
    });

    expect(manifest).toEqual({
      schemaVersion: 2,
      sourceFile: 'source.mov',
      exportedAt: '2026-09-12T04:00:00.000Z',
      clips: [
        {
          id: 'one',
          name: 'intro',
          start: 2,
          end: 32,
          duration: 30,
          status: 'exported',
          outputFile: 'source-intro.mp4',
          settingsCaptured: true,
          settings: capturedSettings,
        },
        {
          id: 'two',
          name: 'outro',
          start: 40,
          end: 65,
          duration: 25,
          status: 'failed',
          error: 'FFmpeg failed.',
          settingsCaptured: false,
        },
      ],
    });
  });

  it('copies nested settings so the manifest snapshot cannot be mutated through the queue object', () => {
    const manifest = buildBatchExportManifest({ sourceFile: 'source.mov', clips: [clips[0]], files: [new File(['x'], 'intro.mp4')], failures: [] });
    expect(manifest.clips[0].settings).not.toBe(clips[0].settings);
    expect(manifest.clips[0].settings?.captionStyle).not.toBe(clips[0].settings?.captionStyle);
  });

  it('creates a readable JSON sidecar file', async () => {
    const manifest = buildBatchExportManifest({ sourceFile: 'source.mov', clips: [clips[0]], files: [new File(['x'], 'intro.mp4')], failures: [] });
    const file = createBatchExportManifestFile(manifest);
    expect(file.name).toBe('export-manifest.json');
    expect(file.type).toBe('application/json');
  });
});
