# Caption Burn-in Compatibility Validation

## Decision

The locked FFmpeg.wasm 0.11 core remains suitable for this project, but the production caption path does not rely on libass font discovery. Burned-in captions are rasterized by the browser into transparent PNG overlays and then composited by the existing self-hosted FFmpeg pipeline.

This keeps caption export local, deterministic, and independent of operating-system fonts, a bundled font binary, a runtime font CDN, or a paid service.

## What Sprint 13 validated

The FFmpeg.wasm 0.11 core build lineage includes the libraries required for ASS subtitle rendering:

- `libass` for ASS/SSA subtitle rendering
- FreeType for font rendering
- FriBidi and HarfBuzz for text direction/shaping support

The application also has deterministic ASS serialization from clipped/rebased caption cues. That work remains useful reference capability and confirms that a major FFmpeg.wasm migration is not required for caption work.

## Why Sprint 14 uses rasterized overlays

Direct libass rendering inside WebAssembly still depends on a usable font being available inside FFmpeg's in-memory filesystem. A desktop FFmpeg installation normally has system fonts available, while a browser WebAssembly filesystem does not automatically inherit them.

Rather than add and maintain a separate font asset only for FFmpeg, the editor now uses the browser's canvas text renderer to create a transparent image for each active caption cue. FFmpeg then overlays those images at the cue's rebased timestamps. The same caption size, vertical position, and backdrop choices used by the live preview drive the rendered export overlays.

This approach has several advantages:

1. no additional font package or binary asset is required;
2. no third-party runtime request is introduced;
3. caption text is rendered before FFmpeg sees it, avoiding libass/fontconfig variability;
4. active clips and queued clips can reuse the same deterministic cue-rebasing logic;
5. temporary caption images can be removed from the FFmpeg filesystem after each export;
6. the existing SRT sidecar path remains available whether burn-in is enabled or not.

## Current acceptance gate

The implementation is considered safe to expose only when normal TypeScript, lint, unit-test, and production-build validation remain green. The next useful hardening slice is a browser-level smoke test using a small generated video fixture so actual caption pixels are exercised end-to-end in CI or Docker where practical.

## Scope boundary

Caption burn-in remains entirely browser-local. This work does not require AWS, an external transcription provider, a runtime CDN, or a major FFmpeg.wasm upgrade.
