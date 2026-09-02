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
Delivered:
- Self-hosted locked FFmpeg core assets instead of a runtime CDN dependency.
- Static-export-compatible Node serving and Docker/nginx consistency.
- Browser runtime capability checks and actionable processing errors.
- Empty/unsupported input rejection and large browser-file warnings.
- Real drag/drop upload behavior and focused runtime/file validation tests.
- Path-scoped Docker build/start/health smoke validation.
- Remaining known ESLint suppression cleanup.

The FFmpeg 0.12 API migration remains isolated as a future dependency-modernization task rather than being coupled to runtime hardening.

## Sprint 6 - Authentication reliability
Status: **Implemented - awaiting merge**
Delivered:
- Refresh-token exchange for expired Cognito access/ID tokens.
- Deduplicated concurrent refresh attempts and retained refresh tokens when Cognito rotates only access/ID tokens.
- Automatic expired-session restoration in protected views and navigation.
- Auth-change events so navigation state updates after token changes in the current tab, plus storage-event synchronization across tabs.
- Profile API calls now request a valid access token and provide a clear expired-session message when refresh is unavailable.
- Rejected refresh tokens clear stale browser session state.
- Missing Cognito configuration and sign-in failures surface actionable user-facing messages.
- Focused tests for valid, refreshed, and rejected sessions.

Architecture note: this remains a static SPA using browser storage. A backend-for-frontend with secure session cookies remains the preferred future direction if the application grows to handle more sensitive server-side capabilities.

## Sprint 7 - Editing/productivity features
Recommended:
- Vertical crop positioning for tall/narrow source material.
- Audio controls: mute, gain/normalization, and simple fade-in/fade-out.
- Multiple clips from one uploaded source.
- Named export jobs and predictable filenames.
- Recent local project/session recovery using browser metadata only.
- Optional exact numeric in/out time fields alongside sliders.
- Source metadata display: dimensions, duration, detected/selected frame rate, and estimated output settings.

## Sprint 8 - Assisted short creation
Candidate capabilities:
- Local or service-backed transcription.
- Caption generation and styling.
- Suggested 30-60 second segments based on transcript/content signals.
- Multiple candidate clips from one long-form source.
- Human review/editing before any suggested clip is exported.

These features should remain optional assistance. The user should remain in control of clip selection, framing, timing, captions, and export.
