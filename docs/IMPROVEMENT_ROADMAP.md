# Video Short Converter Improvement Roadmap

## Purpose
This roadmap captures the improvement plan for the Video Short Converter. Work is intentionally sequenced so reliability and maintainability improve before larger editing and assisted-creation features are introduced.

## Guiding principles
- Keep changes incremental, reviewable, and protected by CI.
- Preserve existing user-facing behavior unless a sprint explicitly targets product behavior.
- Prefer typed, testable modules over large multi-responsibility components.
- Keep browser-side video processing reliable and observable without excessive debug noise.
- Keep normal PR validation fast; expensive/specialized checks should be path-scoped or separate.
- Keep AWS deployment disabled while paid AWS hosting is not desired.
- Avoid dependency automation churn for dormant infrastructure.

## Sprints 1-15
Status: **Complete**
Delivered the repository/architecture hardening, editing and framing workflow, export preview/preferences, Docker testing, self-hosted FFmpeg runtime, Cognito refresh reliability, crop/audio controls, transcript-assisted clip discovery, caption preview/SRT workflow, multi-clip queue, browser-local recovery, zero-cost maintenance policy, caption compatibility validation, browser-rasterized caption burn-in, and the in-app caption runtime safety gate.

## Sprint 16 - Automated browser caption-runtime coverage
Status: **Complete**
Delivered:
- Add a focused Chromium/Playwright test that loads the application's self-hosted FFmpeg.wasm core in a real browser.
- Rasterize a caption overlay through the production caption renderer and feed it to FFmpeg's in-memory filesystem.
- Execute the same generated-color, PNG-overlay, H.264 encode shape used by the runtime safety gate and require non-empty MP4 output.
- Configure cross-origin isolation headers consistently for local static serving, Docker/nginx, and Vercel so FFmpeg.wasm can initialize reliably.
- Keep the test fixture generated in-browser, avoiding binary fixtures, external downloads, AWS, and paid services.

## Sprint 17 - Path-scoped caption runtime validation
Status: **Complete**
Delivered:
- Move the expensive Chromium/FFmpeg caption smoke test out of the always-running general CI workflow.
- Trigger the browser encode gate only when caption rendering, video processing, FFmpeg runtime assets, browser test infrastructure, static serving, or dependency manifests change.
- Keep normal TypeScript, ESLint, unit-test, and production-build validation unchanged on every PR.
- Preserve the real-browser caption safety coverage while avoiding Chromium installation and a second production build for unrelated changes.
- Retain independent concurrency cancellation for both standard CI and the specialized caption runtime workflow.

## Sprint 18 - Smarter local clip ranking
Status: **Complete**
Delivered:
- Improve transcript-assisted short suggestions without adding a cloud analysis provider, API key, paid service, or network dependency.
- Reward candidates that begin at sentence-like boundaries instead of mid-thought.
- Reward candidates that finish with strong punctuation so suggested clips are more likely to feel complete.
- Recognize lightweight hook language such as questions, how/why/what openings, contrast, results, tips, problems, and mistakes.
- Preserve the existing 30–60 second bounds, non-overlap behavior, and human-in-the-loop selection.
- Add deterministic tie-breaking so identical transcript input produces stable suggestions.
- Cover hook/boundary preference and deterministic ranking with focused tests.

## Sprint 19 - PKCE login reliability
Status: **Complete**
Delivered:
- Bind every PKCE verifier to a cryptographically random OAuth `state` value instead of one global verifier key.
- Validate callback state, transaction age, redirect URI continuity, and callback origin before exchanging the authorization code.
- Automatically hand login off to the configured callback origin before generating PKCE when sign-in starts on a preview or alternate hostname, preventing origin-scoped browser storage loss.
- Re-enter Cognito authorization from that configured origin without carrying the verifier through the URL.
- Remove completed or invalid PKCE transactions and reject stale callbacks with actionable error messages.
- Add focused tests for cross-origin handoff, successful state-bound token exchange, missing state, missing transactions, and expired transactions.

## Sprint 20 - Per-clip export-setting snapshots
Status: **Complete**
Delivered:
- Snapshot framing, quality, frame rate, audio, caption style, and caption burn-in choices when a clip is added to the queue.
- Restore a queued clip's saved settings when it is selected for further editing.
- Use each queued clip's own saved settings during batch export instead of applying the current global editor state to every clip.
- Persist queued clip snapshots through browser-local project recovery while remaining compatible with older queue items that have no settings snapshot.
- Persist the current caption burn-in choice as part of project recovery.
- Carry the selected frame rate into FFmpeg output so the existing frame-rate control now affects generated files.
- Add focused queue/recovery tests for snapshots and legacy compatibility.

## Sprint 21 - Production dependency security gate
Status: **Complete**
Delivered:
- Keep reproducible `npm ci` installs while skipping npm's broad install-time audit of development-only packages.
- Add an explicit high-severity production dependency audit to normal CI with `npm audit --omit=dev --audit-level=high`.
- Fail pull requests if a high or critical vulnerability enters the dependencies shipped with the application.
- Keep existing Snyk coverage and avoid duplicate noisy failures from development-only test/coverage tooling.
- Preserve the fast CI shape and avoid lockfile surgery, forced major upgrades, AWS activation, or paid services.

## Sprint 22 - Single-download batch ZIP export
Status: **Complete**
Delivered:
- Keep queued clips rendering sequentially through FFmpeg so browser memory pressure remains predictable.
- Collect the generated MP4 files and package batches of two or more clips into one standards-compliant ZIP download.
- Build the ZIP entirely in the browser without adding an npm dependency, network upload, AWS resource, or paid service.
- Store MP4 files without recompression so packaging does not waste CPU trying to compress already-compressed video.
- Stream CRC-32 calculation when browser support is available and reuse each generated File as a ZIP Blob part instead of duplicating full video buffers.
- Sanitize and de-duplicate archive entry names, keep one-clip exports as a direct MP4 download, and reject unsupported ZIP32-size batches with actionable errors.
- Add focused tests for CRC-32, archive naming, duplicate entry handling, ZIP signatures, and empty-batch validation.

## Sprint 23 - Resilient batch export and retry
Status: **Complete**
Delivered:
- Continue processing the remaining queue when an individual clip export fails instead of aborting the entire batch.
- Preserve and download/package every clip that exported successfully during a partially failed run.
- Track failed queue items independently and surface them directly in the clip queue.
- Provide a one-click retry action that reprocesses only failed clips rather than repeating successful work.
- Report partial-success and failure summaries while keeping full failures actionable.
- Clear stale failure markers when a failed clip is removed or a new source is loaded.
- Add focused tests for partial success, multiple failures, failure summaries, queue highlighting, and retry invocation.

## Sprint 24 - Batch export manifest
Status: **Complete**
Delivered:
- Add a versioned `export-manifest.json` to multi-clip ZIP exports without adding a service or dependency.
- Record the source filename, export timestamp, queue order, clip names, in/out times, durations, successful output filenames, and per-clip failure messages.
- Include a manifest even when a multi-clip batch has only one successful output so partial exports remain self-describing.
- Keep single queued-clip export as a direct MP4 download with no extra browser download.
- Keep all manifest generation local in the browser and package it through the existing ZIP writer.
- Add focused tests for deterministic manifest content and JSON sidecar creation.

## Sprint 25 - Reproducible export manifest settings
Status: **Complete**
Delivered:
- Advance the batch manifest schema to version 2 and record each queued clip's saved framing, quality, frame rate, audio, caption-style, and caption-burn settings.
- Mark whether settings were captured for each clip so older recovered queue items never imply reproducibility when they predate per-clip snapshots.
- Deep-copy nested caption settings into the manifest so later in-memory edits cannot mutate the generated handoff metadata.
- Preserve queue order, output mapping, partial-failure reporting, and all-local ZIP packaging.
- Add focused tests for captured settings, legacy provenance, and immutable manifest snapshots.

## Sprint 26 - Browser-local export history
Status: **Complete**
Delivered:
- Keep the ten most recent completed batch-export results in browser local storage using metadata only; never persist video bytes.
- Record clip counts, successful output filenames, failed clip names/messages, and completion timestamps after each batch attempt.
- Surface the recent export history beneath the clip queue and update it immediately after an export or retry finishes.
- Provide a local Clear history action and listen for browser storage changes so multiple tabs stay in sync.
- Safely ignore malformed persisted history and cap retention to prevent unbounded local-storage growth.
- Add focused storage and UI tests while keeping the feature dependency-free, local-only, and zero-cost.

## Sprint 27 - Downloadable export-history manifests
Status: **Complete**
Delivered:
- Retain a metadata-only manifest snapshot with each new browser-local export-history entry.
- Record queue order, clip timing/duration, success/failure state, output filenames, failure messages, and captured per-clip render/audio/caption settings.
- Add a Download metadata manifest action for retained history entries without storing generated video bytes.
- Preserve backward compatibility for existing Sprint 26 history entries that predate retained manifests.
- Keep history capped at ten entries and local to the browser with no backend, network upload, AWS resource, or paid service.
- Add focused tests for metadata-only snapshots, legacy history parsing, and downloadable JSON manifest creation.

## Sprint 28 - Restore queue from export history
Status: **Complete**
Delivered:
- Rebuild clip queue items from retained export-history manifests, including names, ranges, and captured per-clip export settings.
- Generate fresh queue IDs so restored history never collides with historical queue identity.
- Add a Restore queue action beside downloadable history manifests.
- Reuse the existing browser-local project recovery flow when the editor does not provide a live restore callback, keeping local-file permission handling unchanged.
- Reject malformed historical ranges before they can be restored.
- Add focused helper and UI tests while keeping the feature dependency-free, local-only, and zero-cost.

## Sprint 29 - Source-aware history restore
Status: **Complete**
Delivered:
- Advance new export-history manifests to schema version 2 when the current project source fingerprint is available.
- Retain the original local source name, size, and last-modified timestamp as metadata only; never store video bytes or a file handle.
- Build restored project recovery directly from retained history source identity so the user can re-select and validate the exact original video.
- Keep schema-version-1 history and older entries backward-compatible, with existing recovery metadata used only as a legacy fallback.
- Surface the retained source filename in recent export history and reject malformed schema-version-2 source fingerprints.
- Add focused tests for source metadata round-trips, validation, and source-specific recovery creation.

## Sprint 30 - Batch export orchestration extraction
Status: **Complete**
Delivered:
- Extract sequential batch execution outcome handling, failure-ID collection, direct-download selection, ZIP/manifest packaging, and final status/error generation from the oversized editor component into a typed orchestration module.
- Keep FFmpeg rendering inputs and editor state ownership unchanged so the refactor does not alter export behavior.
- Preserve direct MP4 downloads for one queued clip, ZIP plus manifest packaging for multi-clip or partial-success batches, retry messaging, and all-failure handling.
- Keep export-history recording in the existing resilient batch runner so source-aware history behavior remains unchanged.
- Reduce `VideoEditor.tsx` export-path responsibilities to render callbacks, progress/state updates, and browser download dispatch.
- Add focused orchestration tests for single success, partial multi-clip success, and complete failure.

## Sprint 31 - Clip render option extraction
Status: **Complete**
Delivered:
- Extract queued-clip render option resolution from `VideoEditor.tsx` into a pure typed helper.
- Keep saved per-clip setting snapshots authoritative while preserving current-editor fallback behavior for legacy queue items.
- Centralize video, audio, output filename, caption-burn, caption-style, and clip-scoped transcript cue construction.
- Preserve FFmpeg invocation, progress reporting, batch orchestration, retry targeting, and browser download behavior.
- Add focused tests for legacy fallback behavior, saved-setting precedence, sanitized output naming, and transcript cue scoping.

## Sprint 32 - Centralized editor export settings snapshot
Status: **Complete**
Delivered:
- Build one typed `ClipExportSettings` snapshot from the current editor state instead of reconstructing the same export-affecting fields in multiple paths.
- Reuse that snapshot when adding clips to the queue, building browser-local project recovery, and providing fallback settings for legacy queue items during batch export.
- Deep-copy caption style into the snapshot and recovery state so later editor mutations cannot silently alter retained settings.
- Add a typed recovery-state builder that maps the shared settings snapshot into the existing recovery schema without changing persisted compatibility.
- Keep single-clip processing, FFmpeg invocation, queue selection restore behavior, batch orchestration, retry, history, ZIP, and manifest behavior unchanged.
- Add focused tests for complete snapshot coverage, nested caption immutability, and recovery construction from the shared snapshot.

## Sprint 33 - Centralized recovery settings normalization
Status: **Complete**
Delivered:
- Reuse one typed normalizer for top-level recovery settings and queued-clip settings.
- Add `recoveryExportSettings` as the typed inverse of recovery-state construction.
- Preserve the project-recovery v1 storage schema and legacy queue compatibility.
- Deep-copy nested caption style at recovery boundaries.
- Add focused tests proving malformed top-level and queued settings normalize consistently.

## Sprint 34 - Recovered trim-range hardening
Status: **Complete**
Delivered:
- Clamp negative recovered trim endpoints to zero.
- Clear reversed or zero-length top-level trim ranges instead of restoring impossible edits.
- Preserve valid incomplete start-only/end-only recovery marks.
- Reject queued clips with negative starts, reversed ranges, or zero-length ranges.
- Preserve the existing recovery storage schema and valid saved projects.
- Add focused regression coverage for malformed top-level and queued ranges.

## Sprint 35 - Recovery source fingerprint validation
Status: **Complete**
Delivered:
- Reject empty or whitespace-only saved source filenames.
- Require source size and last-modified values to be non-negative safe integers.
- Preserve valid zero-byte and zero-timestamp fingerprints rather than relying on truthiness checks.
- Centralize source fingerprint parsing.
- Keep the existing project-recovery v1 schema and valid saved projects unchanged.
- Add focused regression coverage for malformed and boundary-value source metadata.

## Sprint 36 - Agile project controls and immutable recovery queue snapshots
Status: **Complete**
Delivered:
- Make project planning/status explicit and durable in the repository.
- Ensure recovery metadata is a true point-in-time snapshot of queued clips and nested export settings.

- Added an Agile operating model with cadence, Definition of Ready, Definition of Done, risk controls, and sprint review expectations.
- Added a prioritized product backlog with explicit item state and cost/privacy constraints.
- Brought roadmap status through Sprint 35 up to date.
- Deep-copied recovery queue items, per-clip export settings, and nested caption styles when constructing recoverable state.
- Added a regression test proving later mutation of the live queue cannot change the retained recovery snapshot.
- Preserved recovery schema compatibility, user-facing behavior, AWS-disabled policy, and zero-cost/local processing.

## Sprint 37 - Centralized editor settings application
Status: **Complete**
Delivered:
- Remove duplicated export-setting application logic from `VideoEditor.tsx` without changing editor behavior.

- Added one typed helper that applies every `ClipExportSettings` field through explicit setters.
- Reused the helper for recovered projects and queued clips with saved settings.
- Reused `recoveryExportSettings` instead of manually mapping recovery fields in the component.
- Copied nested caption style before applying it so active editor state cannot alias retained settings.
- Added focused coverage for complete setter application and caption-style isolation.
- Preserved queue selection, project recovery, export, AWS-disabled policy, and local-only processing behavior.

## Sprint 38 - Export preference persistence extraction
Status: **Complete**
Delivered:
- Remove browser-local export preference parsing/serialization from `VideoEditor.tsx` while preserving the existing preference contract.

- Added a typed parser for saved preset, crop positions, and quality preferences.
- Clamped finite crop percentages to 0–100 and ignored malformed/non-finite values.
- Ignored invalid JSON and unsupported quality values without breaking editor initialization.
- Added deterministic serialization for the current preference snapshot.
- Reused the helper from the editor's load/save effects.
- Added focused coverage for valid, malformed, clamped, and serialized preferences.
- Preserved the existing local-storage key, editor behavior, AWS-disabled policy, and local-only processing.

## Sprint 39 - Trim-range normalization extraction
Status: **Complete**
Goal:
- Remove trim-range normalization and duration arithmetic from `VideoEditor.tsx` while preserving current editing behavior.

Acceptance criteria:
- Add pure typed helpers for loaded-media range normalization, exact start updates, exact end updates, and explicit range selection.
- Clamp loaded/exact trim values using the existing duration boundaries.
- Preserve current null/end semantics for open-ended trim state.
- Keep duration calculations non-negative.
- Reuse the helpers from metadata loading, exact in/out edits, and suggested/queued clip selection.
- Add focused unit coverage for negative/out-of-range values, open-ended ranges, and reversed selected ranges.
- Keep user-facing editor behavior, AWS-disabled policy, dependencies, and local-only processing unchanged.
- Require normal CI and any applicable specialized checks to be green before merge.

## Sprint 40 - Active render-option resolution
Status: **Complete**
Goal:
- Remove active single-clip render-option construction from `VideoEditor.tsx` and resolve it through a typed helper.

Acceptance criteria:
- Build active video, audio, output, and caption options from `ClipExportSettings` in one pure helper.
- Scope transcript cues to the active trim range using the existing transcript behavior.
- Reuse the helper in the preview-first processing path.
- Keep batch export behavior, filenames, user-facing behavior, dependencies, AWS-disabled policy, and local-only processing unchanged.
- Add focused unit coverage for active render option resolution.

## Sprint 41 - Playback navigation calculation extraction
Status: **Complete**
Goal:
- Remove playback seek/offset and mark-boundary arithmetic from `VideoEditor.tsx` while preserving current interaction behavior.

Acceptance criteria:
- Add pure helpers for seek clamping, time offsets, frame-step conversion, mark-in normalization, and mark-out normalization.
- Reuse the helpers in direct seeking, quick jumps, frame stepping, and mark-in/out handlers.
- Preserve the existing near-zero mark-in snap and never allow mark-out before mark-in.
- Add focused tests for bounds, frame offsets, near-zero mark-in, and mark-out-before-start cases.
- Keep user-facing behavior, dependencies, AWS-disabled policy, and local-only processing unchanged.

## Sprint 42 - Profile API CORS reliability hotfix
Status: **Complete (repository changes)**
Goal:
- Restore profile load/save reliability for HTTPS-hosted app deployments without changing the static-export architecture.

Acceptance criteria:
- Allow HTTPS browser origins in API Gateway HTTP API CORS while retaining the configured primary origin.
- Preserve JWT authorization and the existing profile API route/payload contract.
- Convert browser-level profile fetch failures into an actionable profile API/CORS diagnostic instead of a generic `Failed to fetch`.
- Add focused auth coverage for the network failure path.
- Keep automated AWS deployment disabled; infrastructure changes require the existing explicit/manual deployment process.
- Add no new dependency or paid service.

Operational follow-up:
- The API Gateway CORS change is not live until the explicitly authorized/manual Terraform apply is performed. Automated AWS deployment remains disabled.

## Sprint 43 - Recovery schema versioning and migration
Status: **Complete**
Goal:
- Make persisted project recovery evolution explicit instead of relying on implicit shape compatibility.

Acceptance criteria:
- Serialize new recovery data in a versioned envelope while keeping the existing local-storage key.
- Continue parsing legacy unversioned v1 recovery payloads so existing browser data is preserved.
- Reject unknown or malformed schema versions rather than guessing how to interpret them.
- Keep the existing recovered editor-state validation/normalization rules unchanged.
- Add focused tests for versioned round trips, legacy migration, and unknown-version rejection.
- Add no dependency, paid service, cloud processing, or automated AWS deployment.

## Sprint 44 - Source selection and recovery resolution extraction
Status: **Complete**
Goal:
- Remove video validation, recovery matching, and initial trim/queue decision logic from `VideoEditor.tsx` while preserving current source-selection behavior.

Acceptance criteria:
- Add one typed resolver for source validation and pending-recovery matching.
- Return the initial trim range, queue, and warning/error state required by the editor.
- Restore recovery only when stable source metadata matches the selected file.
- Preserve large-file warnings when recovery is not applied.
- Reuse the resolver from the file-selection handler while keeping React/media element state ownership in the editor.
- Add focused tests for invalid files, matching recovery, mismatched recovery, and large-file warnings.
- Keep dependencies, AWS-disabled policy, cloud processing, and user-facing behavior unchanged.

## Sprint 45 - Keyboard shortcut resolution extraction
Status: **In progress**
Goal:
- Remove shortcut eligibility and key-mapping decisions from `VideoEditor.tsx` while preserving existing editor keyboard behavior.

Acceptance criteria:
- Add a pure typed resolver for supported editor shortcuts.
- Ignore shortcuts when no video is loaded, processed preview is visible, or focus is in input/select/textarea/contenteditable controls.
- Preserve Space play/pause, left/right frame stepping, and I/O mark-in/out mappings.
- Keep event prevention behavior unchanged for playback/frame navigation.
- Reuse the resolver from the global keydown effect while keeping media/state actions in the editor.
- Add focused tests for supported keys, editable targets, preview/no-video state, and unrelated keys.
- Keep dependencies, AWS-disabled policy, cloud processing, and user-facing behavior unchanged.

Recommended next increments:
- Continue extracting editor responsibilities behind typed helpers before adding larger features.
- Define and implement an explicit recovery schema version/migration strategy before future persisted-shape changes.
- Evaluate optional local transcription only after a browser/runtime feasibility spike.
- Continue maintenance upgrades through Renovate within the existing zero-cost/approval policy.

Assisted features remain optional. The user remains in control of clip selection, framing, timing, captions, audio, and export.
