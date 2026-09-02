import { parseTranscript, suggestClips } from '@/components/video-editor/transcript';

describe('transcript-assisted clip discovery', () => {
  it('parses SRT and WebVTT-style timed cues', () => {
    const cues = parseTranscript(`WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nOpening line.\n\n2\n00:00:05,500 --> 00:00:12,000\nSecond line!`);
    expect(cues).toEqual([
      { start: 0, end: 5, text: 'Opening line.' },
      { start: 5.5, end: 12, text: 'Second line!' },
    ]);
  });

  it('suggests bounded non-overlapping 30-60 second clips', () => {
    const cues = Array.from({ length: 18 }, (_, index) => ({ start: index * 5, end: index * 5 + 4.5, text: `Caption ${index}.` }));
    const suggestions = suggestClips(cues, 90, 30, 60, 3);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.length).toBeLessThanOrEqual(3);
    suggestions.forEach((clip) => {
      expect(clip.duration).toBeGreaterThanOrEqual(30);
      expect(clip.duration).toBeLessThanOrEqual(60);
    });
  });

  it('returns no suggestions without timed cues', () => {
    expect(suggestClips([], 120)).toEqual([]);
  });
});
