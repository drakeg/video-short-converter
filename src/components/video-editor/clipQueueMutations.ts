import { createClipQueueItem, type ClipExportSettings, type ClipQueueItem } from './clipQueue';

export function appendClipQueueItem(
  items: ClipQueueItem[],
  startTime: number,
  endTime: number,
  settings: ClipExportSettings,
): ClipQueueItem[] {
  return [...items, createClipQueueItem(startTime, endTime, items.length, undefined, settings)];
}

export function renameClipQueueItem(items: ClipQueueItem[], id: string, name: string): ClipQueueItem[] {
  return items.map((item) => item.id === id ? { ...item, name } : item);
}

export function removeClipQueueItem(items: ClipQueueItem[], id: string): ClipQueueItem[] {
  return items.filter((item) => item.id !== id);
}

export function removeFailedClipId(failedClipIds: string[], id: string): string[] {
  return failedClipIds.filter((itemId) => itemId !== id);
}

export function selectFailedClips(items: ClipQueueItem[], failedClipIds: string[]): ClipQueueItem[] {
  return items.filter((clip) => failedClipIds.includes(clip.id));
}
