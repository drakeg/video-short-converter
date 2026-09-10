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
Status: **Implemented - awaiting merge**
Delivered:
- Keep reproducible `npm ci` installs while skipping npm's broad install-time audit of development-only packages.
- Add an explicit high-severity production dependency audit to normal CI with `npm audit --omit=dev --audit-level=high`.
- Fail pull requests if a high or critical vulnerability enters the dependencies shipped with the application.
- Keep existing Snyk coverage and avoid duplicate noisy failures from development-only test/coverage tooling.
- Preserve the fast CI shape and avoid lockfile surgery, forced major upgrades, AWS activation, or paid services.

Recommended next increments:
- Optional local transcription when browser/runtime support is practical.
- Consider packaging multi-clip exports to avoid browser automatic-download limits.
- Continue maintenance upgrades through Renovate within the existing zero-cost/approval policy.

Assisted features remain optional. The user remains in control of clip selection, framing, timing, captions, audio, and export.
