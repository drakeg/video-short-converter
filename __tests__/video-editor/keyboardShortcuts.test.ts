import { resolveEditorKeyboardAction } from '@/components/video-editor/keyboardShortcuts';

const context = {
  videoLoaded: true,
  previewVisible: false,
  targetTagName: 'DIV',
  targetIsContentEditable: false,
};

describe('resolveEditorKeyboardAction', () => {
  it.each([
    [{ code: 'Space', key: ' ' }, 'toggle-playback'],
    [{ code: '', key: 'ArrowLeft' }, 'previous-frame'],
    [{ code: '', key: 'ArrowRight' }, 'next-frame'],
    [{ code: '', key: 'i' }, 'mark-start'],
    [{ code: '', key: 'I' }, 'mark-start'],
    [{ code: '', key: 'o' }, 'mark-end'],
    [{ code: '', key: 'O' }, 'mark-end'],
  ])('maps supported shortcuts', (event, expected) => {
    expect(resolveEditorKeyboardAction(event, context)).toBe(expected);
  });

  it('ignores shortcuts when no video is loaded or preview is visible', () => {
    expect(resolveEditorKeyboardAction({ code: 'Space', key: ' ' }, { ...context, videoLoaded: false })).toBeNull();
    expect(resolveEditorKeyboardAction({ code: 'Space', key: ' ' }, { ...context, previewVisible: true })).toBeNull();
  });

  it.each(['INPUT', 'SELECT', 'TEXTAREA'])('ignores editable form target %s', (targetTagName) => {
    expect(resolveEditorKeyboardAction({ code: 'Space', key: ' ' }, { ...context, targetTagName })).toBeNull();
  });

  it('ignores contenteditable targets and unrelated keys', () => {
    expect(resolveEditorKeyboardAction({ code: '', key: 'i' }, { ...context, targetIsContentEditable: true })).toBeNull();
    expect(resolveEditorKeyboardAction({ code: '', key: 'x' }, context)).toBeNull();
  });
});
