import { clipTranscript, getActiveCue, parseTranscript, serializeAss, serializeSrt, suggestClips } from '@/components/video-editor/transcript';

describe('transcript-assisted clip discovery', () => {
  it('parses SRT and WebVTT-style timed cues', () => {
    const cues = parseTranscript(`WEBVTT\n\n00:00:00.000 --> 00:00:05.000\nOpening line.\n\n2\n00:00:05,500 --> 00:00:12,000\nSecond line!`);
    expect(cues).toEqual([{ start: 0, end: 5, text: 'Opening line.' }, { start: 5.5, end: 12, text: 'Second line!' }]);
  });

  it('suggests bounded non-overlapping 30-60 second clips', () => {
    const cues = Array.from({ length: 18 }, (_, index) => ({ start: index * 5, end: index * 5 + 4.5, text: `Caption ${index}.` }));
    const suggestions = suggestClips(cues, 90, 30, 60, 3);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.length).toBeLessThanOrEqual(3);
    suggestions.forEach((clip) => { expect(clip.duration).toBeGreaterThanOrEqual(30); expect(clip.duration).toBeLessThanOrEqual(60); });
  });

  it('prefers a complete hook-led thought over a similarly dense fragment', () => {
    const cues = [
      { start: 0, end: 10, text: 'continuing a thought with several useful words' },
      { start: 10, end: 20, text: 'more context and useful details for viewers' },
      { start: 20, end: 30, text: 'the fragment keeps going with useful detail' },
      { start: 30, end: 40, text: 'and ends without a clean boundary' },
      { start: 45, end: 55, text: 'Why does this simple trick actually work?' },
      { start: 55, end: 65, text: 'Because it removes the most common mistake.' },
      { start: 65, end: 75, text: 'Here is the important result for you.' },
      { start: 75, end: 85, text: 'That is the whole idea.' },
    ];
    const [suggestion] = suggestClips(cues, 90, 30, 45, 1);
    expect(suggestion.start).toBe(45);
    expect(suggestion.end).toBe(85);
  });

  it('uses deterministic tie-breaking for equally scored candidates', () => {
    const cues = Array.from({ length: 16 }, (_, index) => ({ start: index * 5, end: index * 5 + 5, text: 'same words here' }));
    const first = suggestClips(cues, 80, 30, 50, 2);
    const second = suggestClips(cues, 80, 30, 50, 2);
    expect(second).toEqual(first);
  });

  it('finds the active caption at the current playhead time', () => {
    const cues = [{ start: 1, end: 3, text: 'Hello' }, { start: 3, end: 5, text: 'World' }];
    expect(getActiveCue(cues, 2)?.text).toBe('Hello');
    expect(getActiveCue(cues, 5)).toBeNull();
  });

  it('clips and rebases captions for a selected short', () => {
    const clipped = clipTranscript([{ start: 8, end: 12, text: 'Before and in' }, { start: 14, end: 18, text: 'Inside' }, { start: 22, end: 24, text: 'After' }], 10, 20);
    expect(clipped).toEqual([{ start: 0, end: 2, text: 'Before and in' }, { start: 4, end: 8, text: 'Inside' }]);
  });

  it('serializes rebased captions as standard SRT', () => {
    expect(serializeSrt([{ start: 0, end: 2.25, text: 'Caption text' }])).toBe('1\n00:00:00,000 --> 00:00:02,250\nCaption text');
  });

  it('serializes deterministic ASS suitable for FFmpeg libass rendering', () => {
    const ass = serializeAss([{ start: 1.25, end: 3.5, text: 'Caption {one} \\ test' }], { size: 'large', position: 'top', backdrop: true }, 1080, 1920);
    expect(ass).toContain('PlayResX: 1080');
    expect(ass).toContain('PlayResY: 1920');
    expect(ass).toContain('Style: Default,Arial,72');
    expect(ass).toContain(',8,60,60,115,1');
    expect(ass).toContain('Dialogue: 0,0:00:01.25,0:00:03.50');
    expect(ass).toContain('Caption \\{one\\} \\\\ test');
  });

  it('keeps an ASS header but omits invalid caption events', () => {
    const ass = serializeAss([{ start: 4, end: 2, text: 'invalid' }], { size: 'medium', position: 'bottom', backdrop: false });
    expect(ass).toContain('[Events]');
    expect(ass).not.toContain('Dialogue:');
  });

  it('returns no suggestions without timed cues', () => { expect(suggestClips([], 120)).toEqual([]); });
});
