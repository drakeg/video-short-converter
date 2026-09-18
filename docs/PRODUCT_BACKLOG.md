# Product Backlog

This backlog is the active, prioritized work queue for Video Shorts Editor. Completed sprint history is recorded in [IMPROVEMENT_ROADMAP.md](IMPROVEMENT_ROADMAP.md). Process and quality gates are defined in [AGILE_PROJECT.md](AGILE_PROJECT.md).

## Priority order

| Priority | Item | State | User value / outcome | Acceptance summary |
| --- | --- | --- | --- | --- |
| P1 | Sprint 39 — extract trim-range normalization | In progress | More reliable trim-state calculations and less component responsibility | Pure helpers own loaded-range normalization, exact in/out bounds, and selected-range duration; focused tests cover edge cases |
| P1 | Further reduce `VideoEditor.tsx` responsibilities | Ready | Easier maintenance and lower regression risk | Extract another cohesive editor responsibility behind typed/tested helpers without changing user-visible behavior |
| P1 | Recovery schema versioning/migration strategy | Ready | Safer future evolution of saved projects | Explicit schema/version handling preserves existing v1 data and tests migration/rejection paths |
| P2 | Optional local transcription feasibility spike | Ready | Faster transcript-assisted editing without cloud upload | Document browser/runtime options, performance constraints, bundle size, privacy, and a zero-cost recommendation before implementation |
| P2 | Clip queue UX refinement | Ready | Faster editing of many shorts | Identify and implement a small usability improvement with keyboard/accessibility coverage |
| P2 | Export history usability refinement | Ready | Easier reuse of prior work | Improve restore/history clarity without storing video bytes or requiring a backend |
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
