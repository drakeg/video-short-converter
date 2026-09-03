import { buildSourceFingerprint, parseProjectRecovery, serializeProjectRecovery, sourceMatchesRecovery, type RecoverableProjectState } from '@/components/video-editor/projectRecovery';

const source = { name: 'trip.mp4', size: 123456, lastModified: 1700000000000 };
const recovery: RecoverableProjectState = {
  source,
  savedAt: 1700000001000,
  startTime: 12.5,
  endTime: 48.25,
  presetId: 'vertical',
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
  clipQueue: [{ id: 'clip-1', name: 'waterfall', start: 12.5, end: 48.25 }],
};

describe('project recovery', () => {
  it('round-trips recoverable editor metadata', () => {
    expect(parseProjectRecovery(serializeProjectRecovery(recovery))).toEqual(recovery);
  });

  it('matches a reselected source using stable file metadata', () => {
    expect(buildSourceFingerprint(source)).toEqual(source);
    expect(sourceMatchesRecovery(source, recovery)).toBe(true);
    expect(sourceMatchesRecovery({ ...source, size: source.size + 1 }, recovery)).toBe(false);
  });

  it('rejects invalid recovery payloads and sanitizes malformed values', () => {
    expect(parseProjectRecovery('{not-json')).toBeNull();
    expect(parseProjectRecovery(JSON.stringify({ source: { name: 'x.mp4' } }))).toBeNull();

    const parsed = parseProjectRecovery(JSON.stringify({
      ...recovery,
      cropPosition: 999,
      cropPositionY: -5,
      frameRate: 17,
      clipQueue: [...recovery.clipQueue, { id: 'bad', name: 'bad', start: 8, end: 3 }],
    }));
    expect(parsed?.cropPosition).toBe(100);
    expect(parsed?.cropPositionY).toBe(0);
    expect(parsed?.frameRate).toBe(30);
    expect(parsed?.clipQueue).toEqual(recovery.clipQueue);
  });
});
