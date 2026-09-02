import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'node_modules/@ffmpeg/core/dist');
const target = resolve(root, 'public/ffmpeg');

await mkdir(target, { recursive: true });
for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm', 'ffmpeg-core.worker.js']) {
  await cp(resolve(source, file), resolve(target, file));
}

console.log('Copied FFmpeg core assets to public/ffmpeg');
