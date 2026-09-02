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

Delivered:
- Focused uploader, framing, export-settings, and timeline controls.
- Interactive horizontal crop/framing overlay.
- YouTube Shorts, Instagram Reels/feed, TikTok, square, and landscape presets.
- Draggable timeline in/out handles and keyboard editing shortcuts.
- Configurable source frame rate for frame stepping.
- Deterministic FFmpeg crop/filter generation with direct unit coverage.

## Sprint 3 - Export experience and productivity

Status: **Complete**

Delivered:
- Processed-video preview before download.
- Return-to-editor workflow that retains the uploaded source and trim/framing state.
- Local persistence of non-sensitive preset, quality, and crop-position preferences.
- Standard, High, and Maximum H.264 export-quality choices.
- Cleaner FFmpeg lifecycle behavior, bounded progress reporting, temporary-file cleanup, and clearer processing errors.

## Sprint 4 - Local Docker testing and consistency cleanup

Status: **Implemented - awaiting merge**

Delivered:
- Multi-stage Docker image: Node 20 production build followed by nginx static serving.
- Docker Compose local workflow with configurable `APP_PORT`.
- Explicit `NEXT_PUBLIC_AUTH_REQUIRED=false` local mode so the editor can be tested without Cognito while production remains authenticated by default.
- Path-scoped Docker image/container smoke workflow so normal CI stays fast.
- Updated landing-page instructions and README to match current framing, presets, preview, and download workflow.
- Removed automatic notification-permission prompting on page load.
- Removed committed generated Playwright report and ignored future Playwright/test output.

## Sprint 5 - Runtime/dependency hardening

Recommended next work from the repository audit:
- Modernize the FFmpeg packages as one compatible version set; the current project mixes the older `@ffmpeg/ffmpeg` 0.11 API with newer supporting packages.
- Self-host the FFmpeg core assets instead of relying on a runtime CDN so local/offline behavior is predictable and third-party availability is not required for processing.
- Review the dependency audit findings currently reported during `npm ci` and update vulnerable/transitively deprecated packages without using an uncontrolled force upgrade.
- Resolve the remaining ESLint suppression/warning debt and remove obsolete generated/setup files where safe.
- Reconcile the `npm start` script with `output: "export"`; the app is a static export, so `next start` is not the correct production serving model.
- Add browser capability checks and clearer guidance for unsupported WebAssembly/media combinations and memory-constrained devices.
- Add input validation for unsupported/empty files and helpful large-file warnings before FFmpeg initialization.

## Sprint 6 - Authentication reliability

Recommended:
- Implement access-token refresh using the refresh token already stored by the PKCE flow, or deliberately remove refresh-token handling if sessions are intended to require re-login.
- Centralize auth/session state so navigation, profile, and protected editor views update consistently after token expiry/login/logout.
- Improve user-facing Cognito configuration errors instead of surfacing missing environment variables only after a sign-in click.
- Reassess browser local-storage token persistence before broader/public deployment; a backend-for-frontend/session-cookie model would provide stronger XSS isolation if the architecture expands beyond a static SPA.

## Sprint 7 - Editing/productivity features

Useful additions that fit the current product before AI-assisted creation:
- Vertical crop positioning for tall/narrow source material; current crop interaction primarily solves horizontal framing of wide sources.
- Audio controls: mute, gain/normalization, and simple fade-in/fade-out.
- Multiple clips from one uploaded source so several Shorts/Reels can be prepared without reloading the original file.
- Named export jobs and predictable filenames.
- Recent local project/session recovery using browser metadata only (never persisting source video without explicit user consent).
- Optional exact numeric in/out time fields alongside sliders for precision editing.
- Source metadata display: dimensions, duration, detected/selected frame rate, and estimated output settings.

## Sprint 8 - Assisted short creation

Candidate capabilities:
- Local or service-backed transcription.
- Caption generation and styling.
- Suggested 30-60 second segments based on transcript/content signals.
- Multiple candidate clips from one long-form source.
- Human review/editing before any suggested clip is exported.

These features should remain optional assistance. The user should remain in control of clip selection, framing, timing, captions, and export.
