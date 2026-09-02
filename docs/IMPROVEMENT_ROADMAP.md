# Video Short Converter Improvement Roadmap

## Purpose
This roadmap captures the improvement plan for the Video Short Converter. Work is intentionally sequenced so reliability and maintainability improve before larger editing and assisted-creation features are introduced.

## Guiding principles
- Keep changes incremental, reviewable, and protected by CI.
- Preserve existing user-facing behavior unless a sprint explicitly targets product behavior.
- Prefer typed, testable modules over large multi-responsibility components.
- Keep browser-side video processing reliable and observable without excessive debug noise.
- Keep normal PR validation fast; expensive/specialized checks should be path-scoped or separate.

## Sprint 1 - Repository and architecture hardening
Status: **Complete**
Delivered: fast PR CI, direct ESLint execution, separate production/test TypeScript boundaries, stale-file cleanup, current setup documentation, and corrected product wording.

## Sprint 2 - Editing workflow and framing controls
Status: **Complete**
Delivered: focused editor controls, interactive framing, social presets, draggable timeline handles, keyboard shortcuts, frame stepping, and deterministic FFmpeg filters with unit coverage.

## Sprint 3 - Export experience and productivity
Status: **Complete**
Delivered: processed-video preview, return-to-editor workflow, local export preferences, quality choices, bounded progress, temporary-file cleanup, and clearer processing errors.

## Sprint 4 - Local Docker testing and consistency cleanup
Status: **Complete**
Delivered: multi-stage Docker/nginx image, configurable Compose port, explicit local auth bypass, path-scoped Docker smoke validation, current product documentation, and generated-output cleanup.

## Sprint 5 - Runtime/dependency hardening
Status: **Complete**
Delivered: self-hosted FFmpeg assets, static-export-compatible serving, runtime capability checks, input validation, real drag/drop upload, focused tests, Docker smoke validation, and lint cleanup.

## Sprint 6 - Authentication reliability
Status: **Complete**
Delivered: Cognito refresh-token exchange, deduplicated refresh attempts, automatic expired-session restoration, same-tab/cross-tab auth synchronization, refreshed profile API access, stale-session cleanup, actionable auth errors, and focused session-refresh tests.

## Sprint 7 - Editing/productivity features
Status: **Complete**
Delivered: two-dimensional crop positioning, audio export controls, exact numeric trim fields, source/output metadata, persisted vertical framing, and deterministic crop tests.

Deferred productivity work remains: multiple clips from one source, named export jobs/predictable filenames, and recent local project/session recovery.

## Sprint 8 - Assisted short creation
Status: **Complete**
Delivered:
- Local SRT and WebVTT transcript import without uploading transcript contents.
- Deterministic timed-caption parsing with SRT and WebVTT timestamp support.
- Local 30–60 second candidate-clip discovery ranked by speech density, sentence completion, and proximity to a 45-second target.
- Non-overlapping candidate selection for distinct source regions.
- Human-in-the-loop candidate review that updates editor in/out points without auto-exporting.
- Focused unit coverage for transcript parsing and bounded candidate selection.

## Sprint 9 - Caption workflow
Status: **Implemented - awaiting merge**
Delivered:
- Live caption preview over the source video using imported transcript timing.
- Caption presentation controls for size, top/middle/bottom placement, and optional dark backdrop.
- Selected-clip caption trimming/rebasing so sidecar timestamps begin at zero for the exported short.
- Local SRT sidecar download for the current selected clip.
- Deterministic active-cue lookup, clip rebasing, and SRT serialization with focused unit coverage.
- Caption data remains browser-local; no transcript or video upload is introduced.

Recommended next increments:
- Validate whether the locked FFmpeg.wasm core can reliably burn captions into output across supported browsers before enabling burned-in captions.
- Optional local transcription when browser/runtime support is practical, with service-backed transcription remaining explicitly opt-in.
- Multiple clips from one source, named export jobs, and local project/session recovery.
- Better semantic/topic-boundary ranking once a transcription/analysis provider is deliberately selected.

Assisted features remain optional. The user remains in control of clip selection, framing, timing, captions, audio, and export.
