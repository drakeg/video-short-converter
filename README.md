# Video Shorts Editor

[![License](https://img.shields.io/github/license/drakeg/video-short-converter)](https://github.com/drakeg/video-short-converter/blob/main/LICENSE)


Local development and CI use the exact Node.js 24 version in `.nvmrc` (currently 24.22.3); the Docker builder and `package.json` use the same version. Run `node scripts/check-node-runtime.mjs` to verify that the runtime contract has not drifted. Vercel uses the supported Node 24 runtime family; its patch version is managed by the platform.

A browser-based video editor for trimming local video files, reframing them for social platforms, previewing the processed result, and exporting MP4 clips with FFmpeg WebAssembly.

## Features

- Upload or drag/drop MP4, WebM, MOV, and OGG video files from your device.
- Mark or drag precise trim start/end points, including exact numeric in/out values.
- Queue multiple ranges from one source, rename them, revisit them, and export the queue sequentially.
- Predictable `<source>-<clip-name>.mp4` filenames for queued exports.
- Recover browser-local edit metadata after an accidental refresh/navigation by reselecting the same source file.
- Use keyboard shortcuts and configurable frame-rate stepping for fine edits.
- Reframe video interactively in either horizontal or vertical crop direction.
- Export presets for YouTube Shorts, Instagram Reels/feed, TikTok, square, and landscape video.
- Adjust exported audio with mute, gain, normalization, and fade controls.
- Import local SRT or WebVTT transcripts and get deterministic 30–60 second candidate clips for human review.
- Preview imported timed captions directly over the source video with size, placement, and backdrop controls.
- Optionally burn those captions into active or queued MP4 exports using browser-rasterized transparent overlays.
- Download an SRT sidecar rebased to the currently selected short, with timestamps starting at zero.
- Standard, High, and Maximum H.264 export-quality choices.
- Preview a processed clip before downloading and return to editing without re-uploading.
- Remember non-sensitive export preferences locally in the browser.
- Validate browser capabilities and video files before expensive processing begins.
- Inspect source-file size, frame resolution in megapixels, and average total-file bitrate after media metadata loads, with advisory warnings for especially large, high-resolution, or long sources; no unmeasured memory or processing-speed claims.
- Optional Cognito authentication for deployed environments.

Video processing and transcript/caption workflows are performed in the browser. Source videos and imported transcript contents are not uploaded by these workflows. Session recovery stores only source-file identity metadata and editor settings/clip ranges in browser local storage; the video itself is never persisted there.

## Prerequisites

For Node development:
- Node.js 24
- npm

For container testing:
- Docker with Docker Compose

A modern browser with JavaScript, WebAssembly, Web Workers, canvas/PNG support, and local object-URL support is required. FFmpeg core assets are copied from the locked npm dependency into the static build and served by the application itself; video processing does not depend on a third-party runtime CDN. Before the first export, the app verifies that the local FFmpeg core JavaScript and WebAssembly assets are reachable and reports the exact missing asset/status if that preflight fails.

## Local development with Node

```bash
git clone https://github.com/drakeg/video-short-converter.git
cd video-short-converter
cp .env.local.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`.

`NEXT_PUBLIC_AUTH_REQUIRED=false` in the local example lets the editor be tested without Cognito.

`NEXT_PUBLIC_LOCAL_TRANSCRIPTION_PROTOTYPE=false` keeps experimental local transcription disabled by default. The pinned Transformers.js runtime is dynamically imported only after this developer gate is crossed; normal editor startup does not load a transcription model. A developer-only harness connects local FFmpeg extraction, dynamically loaded Transformers.js Whisper inference, cue normalization, and benchmark result collection. It remains separate from production editor controls; real-browser benchmark measurements must be captured before production UX is considered. The prototype still has no production transcription UI and does not upload source media. With the developer flag enabled, `/transcription-benchmark/` provides a diagnostic for running the local pipeline against an explicitly selected video and downloading measured JSON evidence. Benchmark duration is derived from the extracted 16 kHz audio samples rather than entered manually. Downloaded evidence uses a versioned JSON schema with source fingerprint metadata and browser/runtime context so repeated real-device runs can be compared. Docker Compose forwards `NEXT_PUBLIC_LOCAL_TRANSCRIPTION_PROTOTYPE` as a build-time public setting, so the example `.env` flag behaves consistently in local Docker builds. Model/runtime assets may require network access when the developer explicitly exercises the prototype.

## Local production-style testing with Node

Build the static export and serve it with the repository's dependency-free Node static server:

```bash
npm run build
npm start
```

`npm start` serves the generated `out/` directory on port `3000`. Override it with `PORT`, for example `PORT=8080 npm start`.

## Local testing with Docker

The Docker image performs the same static Next.js production build used for deployment and serves the generated site through nginx.

```bash
cp .env.local.example .env
docker compose up --build
```

Open `http://localhost:3000`. To use another host port, set `APP_PORT` in `.env`, for example `APP_PORT=8080`. Stop and remove the local container with `docker compose down`.

Authentication is disabled by default for the Docker local-testing path. To test Cognito, set `NEXT_PUBLIC_AUTH_REQUIRED=true` and supply valid Cognito/profile values before rebuilding the image, because `NEXT_PUBLIC_*` values are compiled into the static Next.js build.

## Quality checks

Run the same checks used by pull-request CI (Jest transforms JSX in `jest.setup.js` during the test run; Node's plain `--check` cannot parse JSX):

```bash
node --check jest.config.js
node --check __mocks__/ffmpeg.js
node --check scripts/copy-ffmpeg-core.mjs
npm run typecheck
npm run lint
npm test -- --runInBand
npm run build
```

The production TypeScript configuration scopes type checking to application/build code. Jest sources use the separate `tsconfig.test.json` configuration so test globals and DOM mocks do not leak into the production build.

## How to use

1. Upload or drop a local video.
2. Choose a clip using the playhead, mark buttons, keyboard shortcuts, timeline handles, exact numeric fields, or a transcript suggestion.
3. Use **Add current range** to save that range to the clip queue. Rename it if desired, then choose another range and repeat.
4. Optionally import an `.srt` or `.vtt` transcript, preview captions, adjust caption presentation, enable **Burn into video**, or download the selected clip's rebased SRT sidecar.
5. Select framing, audio, quality, and other export settings.
6. Process the active range for the preview-first workflow, or use **Export all** to process every queued range sequentially with predictable filenames.

While a source is open, the editor saves non-sensitive recovery metadata locally. After a browser refresh or accidental navigation, reselect the same local source file to restore trim points, framing, audio controls, caption presentation, and the clip queue. Browser security intentionally prevents the app from reopening the local video automatically.

Queued clips share the active export/framing/audio settings. When caption burn-in is enabled, each queued clip receives only the imported caption cues that overlap that clip, rebased to its own zero-based timeline. Sequential processing deliberately avoids running several FFmpeg encodes concurrently, which would create unnecessary browser-memory pressure.

Burned-in captions are rasterized by the browser to transparent PNG overlays before FFmpeg encoding. This keeps the export path self-contained and avoids depending on operating-system fonts, a bundled font package, or a runtime font CDN. The SRT sidecar workflow remains available independently.

Files that are empty or unsupported are rejected before FFmpeg initializes. Files around 500 MB or larger trigger a browser-memory warning instead of being silently processed as though they were small clips.

## Technology

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS
- FFmpeg.wasm 0.12 with self-hosted UMD core assets and a bundled application worker
- Jest and Testing Library
- Playwright
- Docker / nginx for local production-style testing

## Project planning

- [Agile project operating model](docs/AGILE_PROJECT.md) — cadence, readiness/done criteria, risks, and review expectations.
- [Development and coding standards](docs/DEVELOPMENT_STANDARDS.md) — TypeScript/React conventions, tests, CI, Git/PR practices, security, and documentation synchronization.
- [Product backlog](docs/PRODUCT_BACKLOG.md) — prioritized active work and constraints.
- [Improvement roadmap](docs/IMPROVEMENT_ROADMAP.md) — completed sprint history and near-term direction.
- [Local transcription feasibility](docs/LOCAL_TRANSCRIPTION_FEASIBILITY.md) — evaluated browser-local transcription options, constraints, and staged recommendation.

## Deployment

AWS hosting is intentionally dormant and the repository contains no AWS deployment workflow. The retained Terraform is reference-only and excluded from Renovate while AWS is disabled. See [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) for the current policy. Vercel preview deployments continue to validate pull requests without activating AWS resources.

### Local export timing
After a successful single-clip export, the editor reports observed processing seconds and a processing-to-clip-duration ratio. Measurements are local to the browser session, not telemetry, and do not predict other devices or files. Batch exports are not yet profiled.
