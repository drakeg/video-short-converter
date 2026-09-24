# Product Backlog

This backlog is the active, prioritized work queue for Video Shorts Editor. Completed sprint history is recorded in [IMPROVEMENT_ROADMAP.md](IMPROVEMENT_ROADMAP.md). Process and quality gates are defined in [AGILE_PROJECT.md](AGILE_PROJECT.md).

## Priority order

| Priority | Item | State | User value / outcome | Acceptance summary |
| --- | --- | --- | --- | --- |
| P0 | Apply Sprint 42 profile CORS Terraform change | Blocked — manual approval/deployment required | Makes the merged profile fix live in API Gateway | Run the explicitly authorized/manual Terraform apply; automated AWS deployment remains disabled |
| P2 | Sprint 65 — local transcription prototype gate | In progress | Establishes a safe measurable boundary before introducing a large inference dependency | Add an explicit developer gate, WebGPU/WASM capability resolution, and benchmark contract/tests without exposing production transcription UX |
| P2 | Wire local Whisper prototype runtime | Ready | Validates actual tiny-English Whisper inference without production UX investment | Dynamically load a pinned Transformers.js runtime/model behind the Sprint 65 gate, adapt timestamp output to `TranscriptCue[]`, and capture benchmark evidence before shipping |
| P3 | Maintenance/dependency upgrades | Ready | Reduced security/maintenance drift | Renovate-compatible upgrades pass existing validation and do not reactivate dormant AWS deployment |
| P3 | Performance profiling for larger source files | Ready | More predictable behavior on long/high-resolution video | Measure browser memory/processing bottlenecks and capture actionable thresholds before optimization |

## Backlog constraints
- AWS deployment remains disabled.
- No recurring paid service or cloud media-processing dependency is added without explicit approval.
- Source video and transcript workflows should remain local unless a future sprint explicitly changes that product principle.
- Human review remains authoritative for assisted clip suggestions.
- Large features should be split into independently useful increments.

## Refinement notes
The backlog is intentionally concise. When an item is selected, its pull request/roadmap sprint entry should include detailed acceptance criteria, non-goals, risks, and validation targets. New discoveries should be added here rather than silently expanding an active sprint.
