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


export type ClipQueueMoveDirection = 'up' | 'down';

export function moveClipQueueItem(
  items: ClipQueueItem[],
  id: string,
  direction: ClipQueueMoveDirection,
): ClipQueueItem[] {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return items;
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const reordered = [...items];
  [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
  return reordered;
}
