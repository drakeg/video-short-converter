#!/usr/bin/env node
// Keep development, CI, and Docker on one tested Node.js patch version.
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const expected = JSON.parse(read('package.json')).engines?.node;
const nvmVersion = read('.nvmrc').trim();
const dockerVersion = read('Dockerfile').match(/^FROM node:([\d.]+)-alpine AS builder$/m)?.[1];

if (!/^24\.\d+\.\d+$/.test(expected ?? '')) {
  throw new Error(`package.json engines.node must pin a Node 24 patch version; found ${String(expected)}`);
}

for (const [source, actual] of [['.nvmrc', nvmVersion], ['Dockerfile builder', dockerVersion]]) {
  if (actual !== expected) {
    throw new Error(`${source} uses Node ${actual ?? '<missing>'}, expected ${expected}`);
  }
}

for (const path of [
  '.github/workflows/ci.yml',
  '.github/workflows/caption-runtime-smoke.yml',
  '.github/workflows/repair-security-lockfile.yml',
]) {
  if (!/^\s+node-version-file:\s*\.nvmrc\s*$/m.test(read(path))) {
    throw new Error(`${path} must use node-version-file: .nvmrc`);
  }
}

console.log(`Node runtime contract is aligned at ${expected}`);
