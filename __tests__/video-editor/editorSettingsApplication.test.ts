import { applyEditorExportSettings } from '@/components/video-editor/editorSettingsApplication';
import type { ClipExportSettings } from '@/components/video-editor/clipQueue';

const settings: ClipExportSettings = {
  presetId: 'tiktok',
  cropPosition: 34,
  cropPositionY: 61,
  quality: 'maximum',
  frameRate: 29.97,
  muted: true,
  gainDb: -2,
  normalize: true,
  fadeIn: 0.25,
  fadeOut: 0.75,
  captionStyle: { size: 'large', position: 'top', backdrop: false },
  burnCaptions: true,
};

describe('applyEditorExportSettings', () => {
  it('applies every export-affecting setting through the supplied setters', () => {
    const setters = {
      setPresetId: jest.fn(),
      setCropPosition: jest.fn(),
      setCropPositionY: jest.fn(),
      setQuality: jest.fn(),
      setFrameRate: jest.fn(),
      setMuted: jest.fn(),
      setGainDb: jest.fn(),
      setNormalize: jest.fn(),
      setFadeIn: jest.fn(),
      setFadeOut: jest.fn(),
      setCaptionStyle: jest.fn(),
      setBurnCaptions: jest.fn(),
    };

    applyEditorExportSettings(settings, setters);

    expect(setters.setPresetId).toHaveBeenCalledWith('tiktok');
    expect(setters.setCropPosition).toHaveBeenCalledWith(34);
    expect(setters.setCropPositionY).toHaveBeenCalledWith(61);
    expect(setters.setQuality).toHaveBeenCalledWith('maximum');
    expect(setters.setFrameRate).toHaveBeenCalledWith(29.97);
    expect(setters.setMuted).toHaveBeenCalledWith(true);
    expect(setters.setGainDb).toHaveBeenCalledWith(-2);
    expect(setters.setNormalize).toHaveBeenCalledWith(true);
    expect(setters.setFadeIn).toHaveBeenCalledWith(0.25);
    expect(setters.setFadeOut).toHaveBeenCalledWith(0.75);
    expect(setters.setCaptionStyle).toHaveBeenCalledWith({ size: 'large', position: 'top', backdrop: false });
    expect(setters.setBurnCaptions).toHaveBeenCalledWith(true);
  });

  it('isolates the active caption style from the saved settings snapshot', () => {
    let appliedStyle: ClipExportSettings['captionStyle'] | undefined;
    const noop = () => undefined;

    applyEditorExportSettings(settings, {
      setPresetId: noop,
      setCropPosition: noop,
      setCropPositionY: noop,
      setQuality: noop,
      setFrameRate: noop,
      setMuted: noop,
      setGainDb: noop,
      setNormalize: noop,
      setFadeIn: noop,
      setFadeOut: noop,
      setCaptionStyle: (value) => { appliedStyle = value; },
      setBurnCaptions: noop,
    });

    expect(appliedStyle).toEqual(settings.captionStyle);
    expect(appliedStyle).not.toBe(settings.captionStyle);
  });
});
