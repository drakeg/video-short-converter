import { buildRecoverableProjectState, buildSourceFingerprint, parseProjectRecovery, recoveryExportSettings, serializeProjectRecovery, sourceMatchesRecovery, type RecoverableProjectState } from '@/components/video-editor/projectRecovery';

const source = { name: 'trip.mp4', size: 123456, lastModified: 1700000000000 };
const recovery: RecoverableProjectState = {
  source,
  savedAt: 1700000001000,
  startTime: 12.5,
  endTime: 48.25,
  presetId: 'youtube-short',
  cropPosition: 42,
  cropPositionY: 65,
  quality: 'high',
  frameRate: 30,
  muted: false,
  gainDb: 2,
  normalize: true,
  fadeIn: 0.5,
  fadeOut: 1,
  captionStyle: { size: 'large', position: 'bottom', backdrop: true },
  burnCaptions: true,
  clipQueue: [{
    id: 'clip-1', name: 'waterfall', start: 12.5, end: 48.25,
    settings: {
      presetId: 'tiktok', cropPosition: 35, cropPositionY: 60, quality: 'maximum', frameRate: 29.97,
      muted: true, gainDb: -1, normalize: false, fadeIn: 0.25, fadeOut: 0.75,
      captionStyle: { size: 'small', position: 'top', backdrop: false }, burnCaptions: false,
    },
  }],
};

describe('project recovery', () => {
  it('round-trips recoverable editor metadata including clip settings', () => {
    expect(parseProjectRecovery(serializeProjectRecovery(recovery))).toEqual(recovery);
  });

  it('builds recovery metadata from the same export settings snapshot used by queue and batch fallback', () => {
    const settings = recoveryExportSettings(recovery);
    const built = buildRecoverableProjectState({
      source,
      savedAt: recovery.savedAt,
      startTime: recovery.startTime,
      endTime: recovery.endTime,
      settings,
      clipQueue: recovery.clipQueue,
    });
    expect(built).toEqual(recovery);
    expect(settings.captionStyle).not.toBe(recovery.captionStyle);
    expect(built.captionStyle).not.toBe(settings.captionStyle);
  });

  it('matches a reselected source using stable file metadata', () => {
    expect(buildSourceFingerprint(source)).toEqual(source);
    expect(sourceMatchesRecovery(source, recovery)).toBe(true);
    expect(sourceMatchesRecovery({ ...source, size: source.size + 1 }, recovery)).toBe(false);
  });

  it('keeps legacy queued clips without settings compatible', () => {
    const parsed = parseProjectRecovery(JSON.stringify({ ...recovery, burnCaptions: undefined, clipQueue: [{ id: 'legacy', name: 'old', start: 1, end: 5 }] }));
    expect(parsed?.burnCaptions).toBe(false);
    expect(parsed?.clipQueue).toEqual([{ id: 'legacy', name: 'old', start: 1, end: 5 }]);
  });

  it('normalizes top-level and queued settings with the same defaults', () => {
    const malformedSettings = {
      presetId: '', cropPosition: 999, cropPositionY: -5, quality: 'ultra', frameRate: 17,
      muted: 1, gainDb: 'loud', normalize: 1, fadeIn: -2, fadeOut: -3,
      captionStyle: { size: 'huge', position: 'left', backdrop: 'yes' }, burnCaptions: 1,
    };
    const parsed = parseProjectRecovery(JSON.stringify({
      ...recovery,
      ...malformedSettings,
      clipQueue: [{ id: 'clip', name: 'clip', start: 1, end: 5, settings: malformedSettings }],
    }));
    const expected = {
      presetId: 'youtube-short', cropPosition: 100, cropPositionY: 0, quality: 'standard', frameRate: 30,
      muted: true, gainDb: 0, normalize: true, fadeIn: 0, fadeOut: 0,
      captionStyle: { size: 'medium', position: 'bottom', backdrop: true }, burnCaptions: true,
    };
    expect(parsed && recoveryExportSettings(parsed)).toEqual(expected);
    expect(parsed?.clipQueue[0].settings).toEqual(expected);
  });

  it('rejects invalid recovery payloads and malformed clip ranges', () => {
    expect(parseProjectRecovery('{not-json')).toBeNull();
    expect(parseProjectRecovery(JSON.stringify({ source: { name: 'x.mp4' } }))).toBeNull();

    const parsed = parseProjectRecovery(JSON.stringify({
      ...recovery,
      clipQueue: [...recovery.clipQueue, { id: 'bad', name: 'bad', start: 8, end: 3 }],
    }));
    expect(parsed?.clipQueue).toEqual(recovery.clipQueue);
  });
});