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

Delivered:

- Fast PR CI for TypeScript, ESLint, Jest, and the production Next.js build.
- Direct ESLint execution instead of the removed `next lint` path.
- Separate production and test TypeScript boundaries.
- Removal of stale backup/dead files and stale page-level state.
- Current README/setup guidance and Node 24-era GitHub Action runtimes.
- Corrected product wording for the then-current centered-crop behavior.

## Sprint 2 - Editing workflow and framing controls

Status: **In progress**

Goals:

- Decompose `VideoEditor` into focused controls for uploading, framing, export settings, and timeline editing.
- Add an interactive crop/framing overlay with horizontal positioning instead of a fixed center crop.
- Add output/platform presets for YouTube Shorts, Instagram Reels, TikTok, square, portrait feed, and 16:9 passthrough.
- Add draggable timeline in/out handles with a clearly visible selected range.
- Add keyboard editing shortcuts for play/pause, frame seek, mark in, and mark out.
- Replace the hard-coded 30 FPS stepping assumption with configurable source frame rate.

Implementation decisions:

- Short-form and feed presets use a crop-to-fill FFmpeg filter; the selected horizontal framing position is passed through to the crop expression used during export.
- The 16:9 preset uses fit-and-pad behavior so the full source frame is preserved rather than cropped.
- Source FPS is explicitly selectable (23.976 through 60 FPS common values) because browser media APIs do not expose reliable source frame rate metadata across formats.
- Existing `trimVideo(file, start, end, progress)` callers remain compatible; Sprint 2 adds an optional export-options argument.
- Deeper FFmpeg lifecycle/progress cleanup remains a Sprint 3 concern even though the Sprint 2 export path removes only the initialization complexity necessary to support deterministic preset/filter application.

Exit criteria:

- Existing trim/export behavior remains covered by tests.
- Crop positioning is reflected in the FFmpeg filter used for export and directly unit tested.
- Timeline handles and keyboard controls are usable without changing the underlying trim/download workflow.
- TypeScript, ESLint, Jest, and production build all pass in PR CI.

## Sprint 3 - Export experience and productivity

Status: **Planned**

Goals:

- Add processed-video preview before final download.
- Allow users to return to framing/timing controls without re-uploading the source.
- Persist non-sensitive export preferences such as aspect ratio, quality, and crop position locally.
- Continue improving FFmpeg initialization, typing, progress reporting, cleanup, and user-facing error messages.
- Reduce routine FFmpeg console noise while retaining useful diagnostic information.

## Future - Assisted short creation

Candidate capabilities:

- Local or service-backed transcription.
- Caption generation and styling.
- Suggested 30-60 second segments based on transcript/content signals.
- Multiple candidate clips from one long-form source.
- Human review/editing before any suggested clip is exported.

These features should be designed as optional assistance. The user should remain in control of clip selection, framing, timing, and export.
