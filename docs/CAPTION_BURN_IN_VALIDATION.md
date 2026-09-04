# Caption Burn-in Compatibility Validation

## Decision

The currently locked FFmpeg.wasm 0.11 core is a viable technical base for burned-in captions, but burn-in remains disabled until a browser smoke implementation proves font loading and rendering in the exact self-hosted runtime used by this application.

This sprint deliberately avoids replacing the locked FFmpeg runtime or enabling an export option that has not been exercised end-to-end in supported browsers.

## What was validated

The FFmpeg.wasm 0.11 core build lineage includes the libraries required for ASS subtitle rendering:

- `libass` for ASS/SSA subtitle rendering
- FreeType for font rendering
- FriBidi and HarfBuzz for text direction/shaping support

The upstream 0.11-era core build configuration enables `--enable-libass`, `--enable-libfreetype`, and `--enable-libfribidi`, and links libass/FreeType/HarfBuzz into the WebAssembly core. This means a separate FFmpeg major-version migration is not a prerequisite for caption burn-in.

The application now also has deterministic ASS generation from the same clipped/rebased caption cues already used by SRT sidecar export. The serializer maps the existing caption size, vertical position, and backdrop choices into an ASS style and escapes ASS control characters before rendering.

## Remaining runtime gate

The remaining uncertainty is font availability inside FFmpeg.wasm's in-memory filesystem. libass can render only when it can resolve a usable font. A desktop FFmpeg installation normally has system fonts available; the browser WebAssembly filesystem does not automatically inherit them.

Before burn-in is exposed in the editor, the implementation must therefore:

1. provide a redistributable application font to the FFmpeg virtual filesystem without depending on a third-party runtime CDN;
2. write the generated ASS file and font into temporary FFmpeg paths;
3. render a short representative clip with the `ass` filter using the self-hosted 0.11 core;
4. verify top/middle/bottom placement, all three caption sizes, backdrop behavior, punctuation, braces/backslashes, and non-ASCII text;
5. clean the ASS/font temporary files after success or failure;
6. retain the current sidecar-only path as a fallback if the runtime smoke test fails.

## Why this is a separate gate

Enabling a caption checkbox based only on compile-time library presence would make export reliability browser-dependent and could produce videos with missing text. The project treats successful rendering with its exact bundled runtime as the acceptance criterion rather than assuming desktop FFmpeg behavior applies to WebAssembly.

## Next implementation slice

Add a local redistributable font asset and a narrowly scoped FFmpeg caption-render smoke path. Once that passes local Docker/browser validation, wire ASS burn-in into active and queued exports behind an explicit user control. No external transcription provider or paid service is required for this work.
