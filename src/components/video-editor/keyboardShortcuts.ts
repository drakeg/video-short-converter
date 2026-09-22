export type EditorKeyboardAction =
  | 'toggle-playback'
  | 'previous-frame'
  | 'next-frame'
  | 'mark-start'
  | 'mark-end';

export interface EditorKeyboardContext {
  videoLoaded: boolean;
  previewVisible: boolean;
  targetTagName?: string | null;
  targetIsContentEditable?: boolean;
}

export function resolveEditorKeyboardAction(
  event: Pick<KeyboardEvent, 'code' | 'key'>,
  context: EditorKeyboardContext,
): EditorKeyboardAction | null {
  if (!context.videoLoaded || context.previewVisible || context.targetIsContentEditable) return null;
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(context.targetTagName ?? '')) return null;

  if (event.code === 'Space') return 'toggle-playback';
  if (event.key === 'ArrowLeft') return 'previous-frame';
  if (event.key === 'ArrowRight') return 'next-frame';

  const key = event.key.toLowerCase();
  if (key === 'i') return 'mark-start';
  if (key === 'o') return 'mark-end';
  return null;
}
