import type { BatchExportFailure } from './batchExport';
import type { ClipQueueItem } from './clipQueue';

export interface BatchExportManifestClip {
  id: string;
  name: string;
  start: number;
  end: number;
  duration: number;
  status: 'exported' | 'failed';
  outputFile?: string;
  error?: string;
}

export interface BatchExportManifest {
  schemaVersion: 1;
  sourceFile: string;
  exportedAt: string;
  clips: BatchExportManifestClip[];
}

interface BuildBatchExportManifestOptions {
  sourceFile: string;
  clips: ClipQueueItem[];
  files: File[];
  failures: BatchExportFailure[];
  exportedAt?: Date;
}

export function buildBatchExportManifest({ sourceFile, clips, files, failures, exportedAt = new Date() }: BuildBatchExportManifestOptions): BatchExportManifest {
  const failedById = new Map(failures.map((failure) => [failure.clip.id, failure]));
  let fileIndex = 0;

  return {
    schemaVersion: 1,
    sourceFile,
    exportedAt: exportedAt.toISOString(),
    clips: clips.map((clip) => {
      const failure = failedById.get(clip.id);
      if (failure) {
        return {
          id: clip.id,
          name: clip.name,
          start: clip.start,
          end: clip.end,
          duration: clip.end - clip.start,
          status: 'failed' as const,
          error: failure.message,
        };
      }

      const file = files[fileIndex++];
      return {
        id: clip.id,
        name: clip.name,
        start: clip.start,
        end: clip.end,
        duration: clip.end - clip.start,
        status: 'exported' as const,
        outputFile: file?.name,
      };
    }),
  };
}

export function createBatchExportManifestFile(manifest: BatchExportManifest): File {
  return new File([`${JSON.stringify(manifest, null, 2)}\n`], 'export-manifest.json', { type: 'application/json' });
}
