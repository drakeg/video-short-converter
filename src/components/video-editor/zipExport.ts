const ZIP32_MAX = 0xffffffff;
const UTF8_FLAG = 0x0800;
const STORED_METHOD = 0;
const DOS_DATE_1980_01_01 = 0x0021;

interface PreparedEntry {
  file: File;
  nameBytes: Uint8Array;
  name: string;
  crc: number;
  offset: number;
}

function setUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true);
}

function setUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true);
}

export function sanitizeZipEntryName(value: string): string {
  const cleaned = value.replace(/[\\/]+/g, '-').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return cleaned || 'clip.mp4';
}

function withSuffix(name: string, suffix: number): string {
  const dot = name.lastIndexOf('.');
  if (dot <= 0) return `${name}-${suffix}`;
  return `${name.slice(0, dot)}-${suffix}${name.slice(dot)}`;
}

export function uniqueZipEntryNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((value) => {
    const base = sanitizeZipEntryName(value);
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate.toLowerCase())) candidate = withSuffix(base, suffix++);
    used.add(candidate.toLowerCase());
    return candidate;
  });
}

function updateCrc32(crc: number, bytes: Uint8Array): number {
  let next = crc;
  for (const byte of bytes) {
    next ^= byte;
    for (let bit = 0; bit < 8; bit++) next = (next >>> 1) ^ (0xedb88320 & -(next & 1));
  }
  return next >>> 0;
}

export function crc32(bytes: Uint8Array): number {
  return (updateCrc32(0xffffffff, bytes) ^ 0xffffffff) >>> 0;
}

async function crc32File(file: File): Promise<number> {
  let crc = 0xffffffff;
  if (typeof file.stream === 'function') {
    const reader = file.stream().getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      crc = updateCrc32(crc, value);
    }
  } else {
    crc = updateCrc32(crc, new Uint8Array(await file.arrayBuffer()));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function localHeader(entry: PreparedEntry): Uint8Array {
  const bytes = new Uint8Array(30 + entry.nameBytes.length);
  const view = new DataView(bytes.buffer);
  setUint32(view, 0, 0x04034b50);
  setUint16(view, 4, 20);
  setUint16(view, 6, UTF8_FLAG);
  setUint16(view, 8, STORED_METHOD);
  setUint16(view, 10, 0);
  setUint16(view, 12, DOS_DATE_1980_01_01);
  setUint32(view, 14, entry.crc);
  setUint32(view, 18, entry.file.size);
  setUint32(view, 22, entry.file.size);
  setUint16(view, 26, entry.nameBytes.length);
  setUint16(view, 28, 0);
  bytes.set(entry.nameBytes, 30);
  return bytes;
}

function centralHeader(entry: PreparedEntry): Uint8Array {
  const bytes = new Uint8Array(46 + entry.nameBytes.length);
  const view = new DataView(bytes.buffer);
  setUint32(view, 0, 0x02014b50);
  setUint16(view, 4, 20);
  setUint16(view, 6, 20);
  setUint16(view, 8, UTF8_FLAG);
  setUint16(view, 10, STORED_METHOD);
  setUint16(view, 12, 0);
  setUint16(view, 14, DOS_DATE_1980_01_01);
  setUint32(view, 16, entry.crc);
  setUint32(view, 20, entry.file.size);
  setUint32(view, 24, entry.file.size);
  setUint16(view, 28, entry.nameBytes.length);
  setUint16(view, 30, 0);
  setUint16(view, 32, 0);
  setUint16(view, 34, 0);
  setUint16(view, 36, 0);
  setUint32(view, 38, 0);
  setUint32(view, 42, entry.offset);
  bytes.set(entry.nameBytes, 46);
  return bytes;
}

function endOfCentralDirectory(entryCount: number, centralSize: number, centralOffset: number): Uint8Array {
  const bytes = new Uint8Array(22);
  const view = new DataView(bytes.buffer);
  setUint32(view, 0, 0x06054b50);
  setUint16(view, 4, 0);
  setUint16(view, 6, 0);
  setUint16(view, 8, entryCount);
  setUint16(view, 10, entryCount);
  setUint32(view, 12, centralSize);
  setUint32(view, 16, centralOffset);
  setUint16(view, 20, 0);
  return bytes;
}

export function buildBatchZipFileName(sourceName: string): string {
  const withoutExtension = sourceName.replace(/\.[^/.]+$/, '').trim() || 'video';
  const safe = withoutExtension.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'video';
  return `${safe}-clips.zip`;
}

export async function createBatchZip(files: File[], archiveName: string): Promise<File> {
  if (files.length === 0) throw new Error('There are no exported clips to package.');
  if (files.length > 0xffff) throw new Error('Too many clips for a standard ZIP archive.');

  const names = uniqueZipEntryNames(files.map((file) => file.name));
  const encoder = new TextEncoder();
  const entries: PreparedEntry[] = [];
  let offset = 0;

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    if (file.size > ZIP32_MAX) throw new Error(`${file.name} is too large for the browser ZIP exporter.`);
    const nameBytes = encoder.encode(names[index]);
    if (nameBytes.length > 0xffff) throw new Error(`${file.name} has a file name that is too long for ZIP export.`);
    const entry: PreparedEntry = { file, nameBytes, name: names[index], crc: await crc32File(file), offset };
    entries.push(entry);
    offset += 30 + nameBytes.length + file.size;
    if (offset > ZIP32_MAX) throw new Error('The batch is too large for the browser ZIP exporter. Export fewer clips at a time.');
  }

  const centralOffset = offset;
  const centralHeaders = entries.map(centralHeader);
  const centralSize = centralHeaders.reduce((total, header) => total + header.length, 0);
  if (centralOffset + centralSize > ZIP32_MAX) throw new Error('The batch is too large for the browser ZIP exporter. Export fewer clips at a time.');

  const parts: BlobPart[] = [];
  for (const entry of entries) parts.push(localHeader(entry), entry.file);
  parts.push(...centralHeaders, endOfCentralDirectory(entries.length, centralSize, centralOffset));
  return new File(parts, archiveName, { type: 'application/zip' });
}
