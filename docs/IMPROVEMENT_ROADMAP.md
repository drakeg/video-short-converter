# Video Short Converter Improvement Roadmap

## Purpose

This roadmap captures the agreed improvement plan for the Video Short Converter. Work is intentionally sequenced so repository reliability and maintainability improve before larger editing and assisted-creation features are introduced.

## Guiding principles

- Keep changes incremental, reviewable, and protected by CI.
- Preserve existing user-facing behavior unless a sprint explicitly targets product behavior.
- Prefer typed, testable modules over large multi-responsibility components.
- Keep browser-side video processing reliable and observable without excessive debug noise.
- Avoid mixing infrastructure hardening with unrelated feature work.

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

Status: **Implemented - awaiting merge**

Delivered:
- Processed-video preview before download.
- Return-to-editor workflow that retains the uploaded source and trim/framing state.
- Local persistence of non-sensitive preset, quality, and crop-position preferences.
- Standard, High, and Maximum export-quality choices mapped to H.264 CRF values.
- Cleaner FFmpeg lifecycle behavior, bounded progress reporting, best-effort silent temporary-file cleanup, and clearer user-facing processing errors.
- Reduced routine console noise while retaining actionable UI errors.

Exit criteria:
- A processed clip is reviewed before download and can be discarded or edited without re-uploading.
- Export preferences survive page reloads using browser-local storage only.
- Existing editor functionality remains covered by the repository CI gate.
- TypeScript, ESLint, Jest, and production build pass in PR CI.

## Future - Assisted short creation

Candidate capabilities:
- Local or service-backed transcription.
- Caption generation and styling.
- Suggested 30-60 second segments based on transcript/content signals.
- Multiple candidate clips from one long-form source.
- Human review/editing before any suggested clip is exported.

These features should be designed as optional assistance. The user should remain in control of clip selection, framing, timing, and export.
