# Video Short Converter Improvement Roadmap

## Purpose

This roadmap captures the agreed improvement plan for the Video Short Converter. The work is intentionally sequenced so repository reliability and maintainability improve before larger editing features are introduced.

## Guiding principles

- Keep changes incremental, reviewable, and protected by CI.
- Preserve existing user-facing behavior unless a sprint explicitly targets product behavior.
- Prefer typed, testable modules over large multi-responsibility components.
- Keep browser-side video processing reliable and observable without excessive debug noise.
- Avoid mixing infrastructure hardening with unrelated feature work.

## Sprint 1 - Repository and architecture hardening

Status: In progress

Goals:

- Add a fast PR CI workflow that validates TypeScript, ESLint, Jest, and the production Next.js build.
- Replace the removed/deprecated `next lint` path with direct ESLint execution.
- Separate production and test TypeScript configuration so Jest-only globals and DOM mocks cannot break a production build.
- Remove checked-in backup files and clearly dead state/code.
- Refresh README/setup guidance for the current repository and supported runtime.
- Establish cleaner component/module boundaries without changing editor behavior.
- Keep the pipeline quick by using one dependency install and cancelling superseded runs.

Exit criteria:

- CI runs automatically for pull requests to `main`.
- `npm run typecheck`, `npm run lint`, `npm test -- --runInBand`, and `npm run build` are represented in CI.
- Production TypeScript compilation does not include Jest test sources.
- Stale backup artifacts are removed.
- Project documentation reflects the current repository and development workflow.

## Sprint 2 - Editing workflow and framing controls

Goals:

- Decompose `VideoEditor` into focused components/hooks such as uploader, preview, timeline, trim controls, and export progress.
- Add an interactive 9:16 crop/framing overlay with horizontal positioning instead of a fixed center crop.
- Add output/platform presets for YouTube Shorts, Instagram Reels, TikTok, square, portrait feed, and optional 16:9 passthrough.
- Add draggable timeline in/out handles with a clearly visible selected range.
- Add keyboard editing shortcuts, including play/pause, fine seek, mark in, and mark out.
- Replace the hard-coded 30 FPS stepping assumption with frame-rate-aware or configurable stepping.

Exit criteria:

- Existing trim/export behavior remains covered by tests.
- Crop positioning is reflected in the FFmpeg filter used for export.
- Timeline and keyboard controls are usable without changing the underlying export contract.

## Sprint 3 - Export experience and productivity

Goals:

- Add processed-video preview before final download.
- Allow users to return to framing/timing controls without re-uploading the source.
- Persist non-sensitive export preferences such as aspect ratio, quality, and crop position locally.
- Improve FFmpeg initialization, typing, progress reporting, cleanup, and user-facing error messages.
- Reduce routine FFmpeg console noise while retaining useful diagnostic information.

## Future - Assisted short creation

Candidate capabilities:

- Local or service-backed transcription.
- Caption generation and styling.
- Suggested 30-60 second segments based on transcript/content signals.
- Multiple candidate clips from one long-form source.
- Human review/editing before any suggested clip is exported.

These features should be designed as optional assistance. The user should remain in control of clip selection, framing, timing, and export.

## Known product/documentation alignment item

The current product language has described the converter as detecting and focusing on the main content area, while the current FFmpeg implementation performs a fixed crop. Until subject-aware framing exists, user-facing wording should accurately describe the behavior. Sprint 2's interactive crop controls are the preferred functional solution.
