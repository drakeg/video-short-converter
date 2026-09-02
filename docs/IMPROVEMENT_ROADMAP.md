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
Status: **Implemented - awaiting merge**
Delivered:
- Two-dimensional crop positioning, including vertical framing for tall/narrow source material.
- Audio export controls for mute, gain, loudness normalization, and fade-in/fade-out.
- Optional exact numeric in/out fields alongside the timeline controls.
- Source/output metadata display for dimensions, duration, selected frame rate, and target resolution.
- Persisted vertical framing preference alongside existing non-sensitive export preferences.
- Deterministic FFmpeg vertical crop positioning with focused unit coverage.

Deferred to a follow-on productivity sprint to keep this change reviewable: multiple clips from one source, named export jobs/predictable filenames, and recent local project/session recovery.

## Sprint 8 - Assisted short creation
Candidate capabilities:
- Local or service-backed transcription.
- Caption generation and styling.
- Suggested 30-60 second segments based on transcript/content signals.
- Multiple candidate clips from one long-form source.
- Human review/editing before any suggested clip is exported.

These features should remain optional assistance. The user should remain in control of clip selection, framing, timing, captions, and export.
