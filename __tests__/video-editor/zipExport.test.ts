import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'node:util';
import { buildBatchZipFileName, createBatchZip, crc32, sanitizeZipEntryName, uniqueZipEntryNames } from '@/components/video-editor/zipExport';

beforeAll(() => {
  globalThis.TextEncoder = NodeTextEncoder as typeof TextEncoder;
  globalThis.TextDecoder = NodeTextDecoder as typeof TextDecoder;
});

describe('batch ZIP export', () => {
  it('calculates the standard CRC-32 value', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });

  it('sanitizes path separators and de-duplicates entry names', () => {
    expect(sanitizeZipEntryName('../clip\\one.mp4')).toBe('..-clip-one.mp4');
    expect(uniqueZipEntryNames(['clip.mp4', 'CLIP.mp4', 'clip.mp4'])).toEqual(['clip.mp4', 'CLIP-2.mp4', 'clip-3.mp4']);
  });

  it('builds a predictable archive name from the source video', () => {
    expect(buildBatchZipFileName('Finger Lakes Trip.mov')).toBe('Finger-Lakes-Trip-clips.zip');
    expect(buildBatchZipFileName('.mp4')).toBe('video-clips.zip');
  });

  it('creates a valid stored ZIP with one local entry and central directory record per file', async () => {
    const first = new File([new Uint8Array([1, 2, 3])], 'first.mp4', { type: 'video/mp4' });
    const second = new File([new Uint8Array([4, 5])], 'second.mp4', { type: 'video/mp4' });
    const archive = await createBatchZip([first, second], 'batch.zip');
    const bytes = new Uint8Array(await archive.arrayBuffer());
    const view = new DataView(bytes.buffer);

    expect(archive.name).toBe('batch.zip');
    expect(archive.type).toBe('application/zip');
    expect(view.getUint32(0, true)).toBe(0x04034b50);

    const signatures: number[] = [];
    for (let offset = 0; offset <= bytes.length - 4; offset++) signatures.push(view.getUint32(offset, true));
    expect(signatures.filter((value) => value === 0x04034b50)).toHaveLength(2);
    expect(signatures.filter((value) => value === 0x02014b50)).toHaveLength(2);
    expect(view.getUint32(bytes.length - 22, true)).toBe(0x06054b50);
    expect(view.getUint16(bytes.length - 14, true)).toBe(2);
    expect(new TextDecoder().decode(bytes)).toContain('first.mp4');
    expect(new TextDecoder().decode(bytes)).toContain('second.mp4');
  });

  it('rejects an empty batch', async () => {
    await expect(createBatchZip([], 'empty.zip')).rejects.toThrow('There are no exported clips to package.');
  });
});
