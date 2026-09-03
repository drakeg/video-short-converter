# Video Short Converter Improvement Roadmap

## Purpose
This roadmap captures the improvement plan for the Video Short Converter. Work is intentionally sequenced so reliability and maintainability improve before larger editing and assisted-creation features are introduced.

## Guiding principles
- Keep changes incremental, reviewable, and protected by CI.
- Preserve existing user-facing behavior unless a sprint explicitly targets product behavior.
- Prefer typed, testable modules over large multi-responsibility components.
- Keep browser-side video processing reliable and observable without excessive debug noise.
- Keep normal PR validation fast; expensive/specialized checks should be path-scoped or separate.
- Keep AWS deployment opt-in/manual while paid AWS hosting is not desired.

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

## Sprint 8 - Assisted short creation
Status: **Complete**
Delivered: local SRT/WebVTT import, deterministic timed-caption parsing, local 30–60 second candidate discovery, non-overlapping suggestions, human review, and focused unit coverage.

## Sprint 9 - Caption workflow
Status: **Complete**
Delivered: live caption preview, caption presentation controls, selected-clip caption rebasing, local SRT sidecar download, deterministic caption helpers, and browser-local caption data.

## Sprint 10 - Multi-clip productivity
Status: **Complete**
Delivered:
- Queue multiple trim ranges from one source video without re-uploading the source.
- Rename queued clips before export and sanitize names into portable filenames.
- Jump back to any queued range for further editing.
- Remove unwanted queued clips without disturbing the active edit.
- Sequential batch export through the existing FFmpeg instance to avoid parallel browser-memory pressure.
- Aggregate batch progress and clear export status.
- Predictable `<source>-<clip-name>.mp4` filenames for queued exports.
- Focused tests for range validation and filename sanitization.

## Sprint 11 - Browser-local session recovery
Status: **Implemented - awaiting merge**
Delivered:
- Persist non-sensitive edit metadata locally while a source video is open.
- Detect a recoverable edit after refresh/navigation and identify the expected source file.
- Restore trim points, crop/framing, export quality/frame rate, audio controls, caption presentation, and queued clips after the same source is reselected.
- Match recovery to the source using name, size, and last-modified metadata so unrelated files do not inherit stale edits.
- Allow the user to explicitly discard the saved recovery state.
- Keep source video bytes and imported transcript text out of recovery storage.
- Make the AWS deployment workflow manual-only so pushes/merges do not attempt paid AWS hosting.
- Add deterministic unit coverage for recovery serialization, source matching, malformed payloads, and bounded values.

Recommended next increments:
- Validate reliable burned-in caption support before enabling subtitle rendering in FFmpeg.wasm.
- Optional local transcription when browser/runtime support is practical.
- Better semantic/topic-boundary ranking once an analysis provider is deliberately selected.
- Continue dependency/security maintenance without blindly forcing major upgrades.

Assisted features remain optional. The user remains in control of clip selection, framing, timing, captions, audio, and export.
