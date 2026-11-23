# Local Transcription Feasibility

## Decision
A browser-local transcription feature is feasible, but it should be introduced as an **optional capability with an explicit compatibility/performance gate**, not as a mandatory editor dependency.

The preferred implementation path for a future sprint is **Transformers.js + an ONNX Whisper model**, using WebGPU when available and a deliberately constrained WebAssembly fallback. Do not bundle a Whisper model into the normal application payload and do not replace the existing SRT/VTT import workflow.

This spike does not add a transcription runtime or model.

## Product requirements
Any implementation must:
- keep source audio and transcript inference local to the browser;
- remain zero recurring-cost;
- preserve manual SRT/VTT import as a fully supported workflow;
- require an explicit user action before downloading a model or starting transcription;
- disclose model download size before download;
- show transcription progress and allow cancellation;
- produce the existing `TranscriptCue[]` contract so suggestions, caption preview, SRT export, and burn-in remain unchanged downstream;
- fail gracefully on unsupported/underpowered browsers without blocking normal editing/export;
- avoid running transcription and FFmpeg export concurrently by default because both can place substantial pressure on browser memory.

## Options evaluated

### 1. Transformers.js + Whisper ONNX — preferred
Hugging Face documents browser-side automatic speech recognition with Whisper through Transformers.js and WebGPU. It already provides the high-level preprocessing/inference pipeline that this application needs.

Advantages:
- TypeScript/JavaScript-oriented integration fits the existing Next.js client application.
- Direct automatic-speech-recognition pipeline rather than maintaining a custom inference layer.
- WebGPU acceleration is an explicit supported path.
- Can preserve the existing transcript domain model by adapting timestamped output to `TranscriptCue[]`.
- Model/runtime can be dynamically imported only when the user chooses local transcription.

Constraints:
- WebGPU is not universal, so capability detection and fallback UX are required.
- Model artifacts are materially larger than ordinary application assets and should be fetched on demand, cached by the browser when possible, and never included in the initial editor bundle.
- We must validate timestamp/chunk output from the exact selected Whisper model before relying on it for clip boundaries.

References:
- https://huggingface.co/docs/transformers.js/guides/webgpu
- https://onnxruntime.ai/docs/get-started/with-javascript/web.html
- https://onnxruntime.ai/docs/tutorials/web/deploy.html

### 2. Direct ONNX Runtime Web + Whisper model — viable but lower-level
ONNX Runtime Web supports WebAssembly broadly and WebGPU on a narrower browser/platform set. It gives more direct control over execution providers and deployment assets.

Advantages:
- Explicit control of WebGPU/WASM execution and runtime assets.
- Strong fit if later profiling shows Transformers.js abstraction overhead is a problem.

Constraints:
- More application-owned audio preprocessing, tokenization/decoding, model orchestration, timestamp handling, and worker lifecycle.
- Higher implementation and maintenance burden without clear user value over the higher-level Transformers.js path for the first version.

Reference:
- https://onnxruntime.ai/docs/tutorials/web/ep-webgpu.html

### 3. whisper.cpp WebAssembly — useful fallback/reference, not first choice
whisper.cpp provides a browser WASM example where audio remains local. Its documentation reports roughly 2–3× real-time performance for tiny/base on a modern CPU/browser in its example and notes unsatisfactory memory/performance beyond the small model.

Advantages:
- Proven fully local WASM route.
- Does not depend on WebGPU.

Constraints:
- CPU transcription can be slow enough to materially affect editing workflow.
- Integration/build/runtime asset management is more specialized than the current npm/Next.js stack.
- Larger models increase memory/performance risk.
- Would require additional work to map its output cleanly into the existing cue workflow.

Reference:
- https://github.com/ggml-org/whisper.cpp/blob/master/examples/whisper.wasm/README.md

## Browser/runtime strategy
Use progressive enhancement:

1. Keep transcript import available everywhere the current editor works.
2. Detect WebGPU before offering the accelerated path.
3. Dynamically import the transcription runtime only after the user chooses **Transcribe locally**.
4. Download the selected model on demand, with visible size/progress/cancel controls.
5. Run inference away from the main UI thread where the chosen library/runtime permits it.
6. Normalize timestamped output to `TranscriptCue[]`.
7. If WebGPU is unavailable, offer a clearly labeled CPU/WASM fallback only for a validated small model/device range; otherwise direct the user to SRT/VTT import.
8. Release model/inference resources when practical before FFmpeg export.

ONNX Runtime's current browser matrix makes WebAssembly the compatibility baseline while WebGPU support is narrower. Therefore WebGPU must be an optimization, not a prerequisite for using the editor.

## Model strategy
Start a proof of concept with an English tiny-class Whisper model because it minimizes download/memory/latency risk while validating the architecture. Do not silently choose a larger model.

Before shipping, measure:
- compressed model download size;
- initialized memory footprint;
- time to first transcription after cold model load;
- transcription time for 1, 5, 15, and 30 minute sources;
- timestamp quality sufficient for caption/clip boundaries;
- CPU usage/UI responsiveness;
- behavior on Chromium/macOS and Chromium/Windows at minimum;
- WASM fallback behavior on a representative non-WebGPU browser.

A larger/multilingual model should be a later explicit product choice based on measured quality versus cost.

## Audio extraction
The editor already owns a local FFmpeg.wasm processing path. A future prototype should reuse that local capability to extract/resample source audio to the format expected by the transcription pipeline rather than uploading media or adding a server conversion service.

The prototype must profile the memory impact of holding source video, decoded/extracted audio, model weights, inference tensors, and FFmpeg state in one browser session. Sequential lifecycle management is preferred over keeping all heavy runtimes resident.

## Privacy and network boundary
The intended feature is local inference: source audio must not be uploaded for transcription. However, the browser will need to obtain runtime/model assets unless they are already cached/self-hosted.

The UI must distinguish:
- **media privacy:** source audio remains local;
- **model download:** model/runtime assets may be fetched from an approved origin.

Before production implementation, decide whether model artifacts are self-hosted with the application or fetched from a model host. Self-hosting gives tighter availability/version control but materially increases deployment/storage bandwidth. Either choice must pin versions and avoid runtime drift.

## Bundle and deployment impact
Do not statically import the transcription stack into the normal editor bundle. ONNX Runtime deployment requires runtime WASM assets in addition to model files, and its documentation recommends considering conditional imports to control bundle size.

A future implementation should:
- use a dynamic import boundary;
- pin runtime/model versions;
- explicitly configure/self-host required WASM assets if that path is selected;
- avoid a third-party runtime CDN dependency for core application execution;
- document model caching and update behavior;
- verify static-export/Vercel/nginx serving of required MIME types and large assets.

## Proposed future implementation increments
1. **Prototype:** hidden/developer-gated Transformers.js Whisper tiny English transcription on extracted local audio; no production UX. Sprints 65–70 established the capability gate, Whisper adapter, dynamic runtime, reproducible dependency, and 16 kHz mono FFmpeg extraction. Sprint 71 connects those boundaries in a developer harness while keeping measured browser results separate from implementation claims.
2. **Benchmark:** Sprint 72 adds a developer diagnostic that captures cold load, inference time, execution provider, realtime factor, timestamps/cues, browser identity, and WebGPU availability as downloadable JSON. Sprint 73 derives benchmark duration from the extracted 16 kHz sample count to avoid manually entered realtime-factor errors. Sprint 74 versions the downloadable evidence and records non-media source fingerprint plus browser/runtime context for reproducible comparisons. Representative macOS/Windows runs remain required before support thresholds are claimed; memory/model-size evidence still requires explicit measurement. Sprint 78 binds exported evidence to the exact selected source and captures it when each run finishes, avoiding stale/misattributed download metadata.
3. **UX:** add explicit Transcribe locally action, compatibility explanation, model download disclosure/progress/cancel, transcription progress/cancel, and actionable errors.
4. **Integration:** adapt timestamped output to `TranscriptCue[]`; existing suggestions/captions/export remain downstream consumers.
5. **Hardening:** worker lifecycle, cleanup, caching/version pinning, long-source chunking, automated tests, browser tests, and documented support thresholds.

Each increment requires its own acceptance criteria and validation before advancing.

## Recommendation
Proceed only with increment 1 as the next transcription implementation sprint. Use Transformers.js with a tiny English Whisper ONNX model and prefer WebGPU. Treat WASM as a measured fallback, not a promise of equivalent performance.

Do **not**:
- add cloud transcription;
- upload source audio;
- remove transcript import;
- preload model weights;
- make transcription required for editing;
- run heavy transcription and FFmpeg encoding concurrently by default; or
- commit to larger models before browser measurements exist.

This keeps the feature aligned with the project's local-first, zero-recurring-cost design while creating a measurable path toward one-click transcript-assisted editing.


## Benchmark evidence integrity gate (Sprint 79)
Developer-only evidence is assessed for invalid/non-finite timings, decoded duration, cue counts, and cue timestamp ranges. Warnings do not modify or discard the raw downloaded evidence, but flagged runs should not establish production support thresholds. Representative device measurements remain uncollected.


## Diagnostic status policy (Sprint 80)
A completed developer benchmark is marked **passed** only when its evidence satisfies the existing quality checks. Completed runs with invalid evidence are marked **warning**, not **passed**, and remain downloadable for investigation. This distinction is about evidence validity, not whether transcription accuracy/performance is approved for production. Representative macOS/Windows/WASM measurements are still pending.


## Local evidence review (Sprint 81)
The developer benchmark page now accepts previously downloaded evidence JSON files for a browser-local comparison table. This is a review utility, not measured validation: users must still run representative Chrome/macOS and Chrome/Windows workloads, with WASM fallback where practical. Imports are schema-validated and capped at 2 MB each; media and benchmark evidence are not uploaded.


## Benchmark import safeguards (Sprint 82)
Selecting more than ten benchmark evidence files now produces a clear error rather than silently discarding extra runs. Empty or oversized (>2 MB) files are rejected before import. Existing reviewed results remain visible when a new selection fails this pre-validation, making the comparison less likely to omit intended data without explanation.
