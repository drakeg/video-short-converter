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

type EditorShortcutEvent = Pick<KeyboardEvent, 'code' | 'key'> &
  Partial<Pick<KeyboardEvent, 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey' | 'repeat' | 'defaultPrevented' | 'isComposing'>>;

export function resolveEditorKeyboardAction(
  event: EditorShortcutEvent,
  context: EditorKeyboardContext,
): EditorKeyboardAction | null {
  if (!context.videoLoaded || context.previewVisible || context.targetIsContentEditable) return null;
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(context.targetTagName?.toUpperCase() ?? '')) return null;

  // Never steal browser/OS shortcuts (Ctrl/Command+O, Alt+Arrow, etc.)
  // or act on a key already handled by another part of the page.
  if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented || event.isComposing) return null;
  // Repeated keydown events must not rapidly toggle playback or overwrite trim markers.
  if (event.repeat) return null;

  if (event.code === 'Space') return 'toggle-playback';
  if (event.key === 'ArrowLeft') return 'previous-frame';
  if (event.key === 'ArrowRight') return 'next-frame';

  // Shift-modified letter shortcuts are intentionally allowed for uppercase I/O.
  const key = event.key.toLowerCase();
  if (key === 'i') return 'mark-start';
  if (key === 'o') return 'mark-end';
  return null;
}
