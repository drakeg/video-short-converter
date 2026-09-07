# Video Short Converter Improvement Roadmap

## Purpose
This roadmap captures the improvement plan for the Video Short Converter. Work is intentionally sequenced so reliability and maintainability improve before larger editing and assisted-creation features are introduced.

## Guiding principles
- Keep changes incremental, reviewable, and protected by CI.
- Preserve existing user-facing behavior unless a sprint explicitly targets product behavior.
- Prefer typed, testable modules over large multi-responsibility components.
- Keep browser-side video processing reliable and observable without excessive debug noise.
- Keep normal PR validation fast; expensive/specialized checks should be path-scoped or separate.
- Keep AWS deployment disabled while paid AWS hosting is not desired.
- Avoid dependency automation churn for dormant infrastructure.

## Sprints 1-15
Status: **Complete**
Delivered the repository/architecture hardening, editing and framing workflow, export preview/preferences, Docker testing, self-hosted FFmpeg runtime, Cognito refresh reliability, crop/audio controls, transcript-assisted clip discovery, caption preview/SRT workflow, multi-clip queue, browser-local recovery, zero-cost maintenance policy, caption compatibility validation, browser-rasterized caption burn-in, and the in-app caption runtime safety gate.

## Sprint 16 - Automated browser caption-runtime coverage
Status: **Complete**
Delivered:
- Add a focused Chromium/Playwright test that loads the application's self-hosted FFmpeg.wasm core in a real browser.
- Rasterize a caption overlay through the production browser caption renderer and feed it to FFmpeg's in-memory filesystem.
- Execute the same generated-color, PNG-overlay, H.264 encode shape used by the runtime safety gate and require non-empty MP4 output.
- Configure cross-origin isolation headers consistently for local static serving, Docker/nginx, and Vercel so FFmpeg.wasm can initialize reliably.
- Keep the test fixture generated in-browser, avoiding binary fixtures, external downloads, AWS, and paid services.

## Sprint 17 - Path-scoped caption runtime validation
Status: **Implemented - awaiting merge**
Delivered:
- Move the expensive Chromium/FFmpeg caption smoke test out of the always-running general CI workflow.
- Trigger the browser encode gate only when caption rendering, video processing, FFmpeg runtime assets, browser test infrastructure, static serving, or dependency manifests change.
- Keep normal TypeScript, ESLint, unit-test, and production-build validation unchanged on every PR.
- Preserve the real-browser caption safety coverage while avoiding Chromium installation and a second production build for unrelated changes.
- Retain independent concurrency cancellation for both standard CI and the specialized caption runtime workflow.

Recommended next increments:
- Optional local transcription when browser/runtime support is practical.
- Better semantic/topic-boundary ranking once an analysis provider is deliberately selected.
- Continue dependency/security maintenance without blindly forcing major upgrades.

Assisted features remain optional. The user remains in control of clip selection, framing, timing, captions, audio, and export.
