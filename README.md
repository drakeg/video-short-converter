# Video Shorts Editor

A browser-based video editor for trimming local video files, reframing them for social platforms, previewing the processed result, and exporting MP4 clips with FFmpeg WebAssembly.

## Features

- Upload or drag/drop MP4, WebM, MOV, and OGG video files from your device.
- Mark or drag precise trim start/end points.
- Use keyboard shortcuts and configurable frame-rate stepping for fine edits.
- Reframe video interactively with a draggable crop overlay.
- Export presets for YouTube Shorts, Instagram Reels/feed, TikTok, square, and landscape video.
- Standard, High, and Maximum H.264 export-quality choices.
- Preview a processed clip before downloading and return to editing without re-uploading.
- Remember non-sensitive export preferences locally in the browser.
- Validate browser capabilities and video files before expensive processing begins.
- Optional Cognito authentication for deployed environments.

Video processing is performed in the browser. Source videos are not uploaded by the trimming/export workflow.

## Prerequisites

For Node development:
- Node.js 20 or later
- npm

For container testing:
- Docker with Docker Compose

A modern browser with JavaScript, WebAssembly, Web Workers, and local object-URL support is required. FFmpeg core assets are copied from the locked npm dependency into the static build and served by the application itself; video processing does not depend on a third-party runtime CDN.

## Local development with Node

```bash
git clone https://github.com/drakeg/video-short-converter.git
cd video-short-converter
cp .env.local.example .env.local
npm ci
npm run dev
```

Open `http://localhost:3000`.

`NEXT_PUBLIC_AUTH_REQUIRED=false` in the local example lets the editor be tested without Cognito. Set it to `true` and provide the Cognito values when testing authentication.

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

Open `http://localhost:3000`.

To use another host port, set `APP_PORT` in `.env`, for example:

```env
APP_PORT=8080
```

Then open `http://localhost:8080`.

Stop and remove the local container with:

```bash
docker compose down
```

Authentication is disabled by default for the Docker local-testing path. To test Cognito, set `NEXT_PUBLIC_AUTH_REQUIRED=true` and supply valid Cognito/profile values before rebuilding the image, because `NEXT_PUBLIC_*` values are compiled into the static Next.js build.

## Quality checks

Run the same checks used by pull-request CI:

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npm run build
```

The production TypeScript configuration scopes type checking to application/build code. Jest sources use the separate `tsconfig.test.json` configuration so test globals and DOM mocks do not leak into the production build.

## How to use

1. Upload or drop a local video.
2. Choose the clip using the playhead, mark buttons, keyboard shortcuts, or timeline handles.
3. Select a platform/output preset and adjust framing.
4. Choose export quality and process the clip.
5. Preview the generated result.
6. Download it or return to the editor for another adjustment without re-uploading the source.

Files that are empty or unsupported are rejected before FFmpeg initializes. Files around 500 MB or larger trigger a browser-memory warning instead of being silently processed as though they were small clips.

## Technology

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS
- FFmpeg.wasm with self-hosted core assets
- Jest and Testing Library
- Playwright
- Docker / nginx for local production-style testing

## Development roadmap

The current audit and improvement plan is maintained in [docs/IMPROVEMENT_ROADMAP.md](docs/IMPROVEMENT_ROADMAP.md).

## Deployment

AWS deployment guidance is available in [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md). Vercel preview deployments are also used for pull-request validation.
