import type { ClipQueueItem } from './clipQueue';

export interface BatchExportFailure {
  clip: ClipQueueItem;
  message: string;
}

export interface BatchExportResult {
  files: File[];
  failures: BatchExportFailure[];
}

export async function runBatchExport(
  clips: ClipQueueItem[],
  exportClip: (clip: ClipQueueItem, index: number, total: number) => Promise<File>,
): Promise<BatchExportResult> {
  const files: File[] = [];
  const failures: BatchExportFailure[] = [];

  for (let index = 0; index < clips.length; index++) {
    const clip = clips[index];
    try {
      files.push(await exportClip(clip, index, clips.length));
    } catch (error) {
      failures.push({
        clip,
        message: error instanceof Error ? error.message : 'Clip export failed.',
      });
    }
  }

  return { files, failures };
}

export function formatBatchFailureSummary(failures: BatchExportFailure[]): string {
  if (failures.length === 0) return '';
  const names = failures.map(({ clip }) => clip.name).join(', ');
  return `${failures.length} clip${failures.length === 1 ? '' : 's'} failed: ${names}`;
}
