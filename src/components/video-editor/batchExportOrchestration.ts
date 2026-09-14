import type { ClipQueueItem } from './clipQueue';
import { formatBatchFailureSummary, runBatchExport } from './batchExport';
import { buildBatchExportManifest, createBatchExportManifestFile } from './exportManifest';
import { buildBatchZipFileName, createBatchZip } from './zipExport';

export interface BatchExportOrchestrationOptions {
  sourceFile: File;
  clips: ClipQueueItem[];
  renderClip: (clip: ClipQueueItem, index: number, total: number) => Promise<File>;
  onPackagingStatus?: (message: string) => void;
}

export interface BatchExportOrchestrationResult {
  download: File | null;
  failedClipIds: string[];
  status: string;
  error: string | null;
}

export async function executeBatchExport({ sourceFile, clips, renderClip, onPackagingStatus }: BatchExportOrchestrationOptions): Promise<BatchExportOrchestrationResult> {
  const result = await runBatchExport(clips, renderClip);
  const failedClipIds = result.failures.map(({ clip }) => clip.id);
  let download: File | null = null;
  let successMessage = '';

  if (result.files.length === 1 && clips.length === 1) {
    download = result.files[0];
    successMessage = 'Exported 1 clip.';
  } else if (result.files.length > 0) {
    onPackagingStatus?.(`Packaging ${result.files.length} successful clip${result.files.length === 1 ? '' : 's'} and export manifest into one ZIP...`);
    const manifest = createBatchExportManifestFile(buildBatchExportManifest({
      sourceFile: sourceFile.name,
      clips,
      files: result.files,
      failures: result.failures,
    }));
    const archive = await createBatchZip([...result.files, manifest], buildBatchZipFileName(sourceFile.name));
    download = archive;
    successMessage = `Exported ${result.files.length} clip${result.files.length === 1 ? '' : 's'} as ${archive.name} with export-manifest.json.`;
  }

  const failureMessage = formatBatchFailureSummary(result.failures);
  if (result.files.length === 0 && failureMessage) {
    return {
      download: null,
      failedClipIds,
      error: failureMessage,
      status: 'No clips were exported. Use Retry failed clips after adjusting the affected ranges or settings.',
    };
  }

  return {
    download,
    failedClipIds,
    error: null,
    status: [successMessage, failureMessage && `${failureMessage}. Retry is available below.`].filter(Boolean).join(' '),
  };
}
