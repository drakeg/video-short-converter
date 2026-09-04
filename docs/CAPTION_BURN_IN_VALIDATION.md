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

Rather than add and maintain a separate font asset only for FFmpeg, the editor uses the browser's canvas text renderer to create a transparent image for each active caption cue. FFmpeg then overlays those images at the cue's rebased timestamps. The same caption size, vertical position, and backdrop choices used by the live preview drive the rendered export overlays.

This approach avoids an additional font package, third-party runtime requests, and libass/fontconfig variability while preserving the independent SRT sidecar workflow.

## Sprint 15 runtime gate

Before the first burned-in-caption export in each browser session, the application now runs a tiny smoke render through the exact FFmpeg.wasm instance that will process the user's video. The probe:

1. rasterizes a representative caption overlay with the same browser renderer used by real exports;
2. generates a short black video source inside FFmpeg;
3. composites the caption overlay with the same overlay filter family used by production exports;
4. encodes a very short H.264 MP4;
5. verifies that FFmpeg returned non-empty output;
6. removes the temporary overlay and output from the FFmpeg virtual filesystem.

A successful probe is cached for the browser session, and concurrent probes share the same promise. If the probe fails, the real burned-in-caption export is stopped immediately with a specific compatibility error instead of spending time on a full video encode that cannot complete reliably.

Caption-disabled exports do not run this probe and retain their existing path.

## Remaining automated hardening

The runtime gate exercises actual caption compositing in the user's browser. A future improvement can additionally automate that path in Playwright/Docker with a small generated fixture so the end-to-end probe is continuously exercised in CI where practical.

## Scope boundary

Caption burn-in remains entirely browser-local. This work does not require AWS, an external transcription provider, a runtime CDN, or a major FFmpeg.wasm upgrade.
