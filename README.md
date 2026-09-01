# Video Shorts Editor

A browser-based video editor for trimming local video files and converting selected clips to portrait video for Shorts, Reels, and TikTok.

## Features

- Upload MP4, WebM, and MOV video files from your device.
- Mark precise trim start and end points.
- Convert selected clips to 9:16 portrait video at 1080x1920.
- Preview and scrub video before export.
- Track browser-side FFmpeg processing progress.
- Use the application on desktop or mobile layouts.

> Current framing behavior uses a fixed portrait crop. Interactive crop positioning and platform-specific export presets are planned; see [the improvement roadmap](docs/IMPROVEMENT_ROADMAP.md).

## Prerequisites

- Node.js 20 or later
- npm
- A modern browser with JavaScript and WebAssembly support

## Local development

1. Clone the repository:

   ```bash
   git clone https://github.com/drakeg/video-short-converter.git
   cd video-short-converter
   ```

2. Install the locked dependency set:

   ```bash
   npm ci
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

For the default Turbopack development server instead of the webpack development path, run:

```bash
npm run dev:fast
```

## Quality checks

Run the same checks used by pull-request CI:

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npm run build
```

The production TypeScript configuration intentionally scopes type checking to application/build code. Jest sources use the separate `tsconfig.test.json` configuration so test globals and DOM mocks cannot leak into `next build` type checking.

## How to use

1. Select a supported video file from your device.
2. Play or scrub to the desired starting position and mark the start.
3. Move to the desired ending position and mark the end.
4. Process the selection and download the generated MP4 file.

Most short-form platforms work best with relatively short clips. Important subjects should currently be kept near the center of the source frame because export uses a fixed portrait crop.

## Technology

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- FFmpeg.wasm
- Jest and Testing Library
- Playwright

## Development roadmap

The current hardening and product improvement plan is maintained in [docs/IMPROVEMENT_ROADMAP.md](docs/IMPROVEMENT_ROADMAP.md). Work is sequenced from CI and maintainability improvements through editing controls, export workflow improvements, and future assisted clip creation.

## Deployment

AWS deployment guidance is available in [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md). Vercel preview deployments are also used for pull-request validation.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
