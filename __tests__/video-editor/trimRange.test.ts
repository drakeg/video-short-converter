import { normalizeLoadedTrimRange, selectTrimRange, updateTrimEnd, updateTrimStart } from '@/components/video-editor/trimRange';

describe('trim range helpers', () => {
  it('normalizes persisted trim points against loaded media duration', () => {
    expect(normalizeLoadedTrimRange(-5, 150, 120)).toEqual({
      startTime: 0,
      endTime: 120,
      duration: 120,
    });
    expect(normalizeLoadedTrimRange(30, null, 90)).toEqual({
      startTime: 30,
      endTime: 90,
      duration: 60,
    });
  });

  it('bounds exact start without moving an existing end', () => {
    expect(updateTrimStart(50, 40, 100)).toEqual({
      startTime: 40,
      endTime: 40,
      duration: 0,
    });
    expect(updateTrimStart(-10, null, 100)).toEqual({
      startTime: 0,
      endTime: null,
      duration: 100,
    });
  });

  it('bounds exact end and materializes a zero start when needed', () => {
    expect(updateTrimEnd(120, 20, 90)).toEqual({
      startTime: 20,
      endTime: 90,
      duration: 70,
    });
    expect(updateTrimEnd(15, null, 90)).toEqual({
      startTime: 0,
      endTime: 15,
      duration: 15,
    });
  });

  it('builds a selected range with non-negative duration', () => {
    expect(selectTrimRange(12, 42)).toEqual({
      startTime: 12,
      endTime: 42,
      duration: 30,
    });
    expect(selectTrimRange(42, 12).duration).toBe(0);
  });
});
