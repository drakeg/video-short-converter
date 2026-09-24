# Development and Coding Standards

These standards apply to every change in Video Shorts Editor. They complement the Agile operating model in [AGILE_PROJECT.md](AGILE_PROJECT.md).

## Core engineering principles
- Prefer small, cohesive changes that are easy to review, test, revert, and explain.
- Keep user-facing behavior explicit. Do not hide meaningful behavior changes inside refactors.
- Preserve local-first video/transcript processing unless an approved sprint intentionally changes that product principle.
- Do not activate AWS resources, recurring paid services, or cloud media processing without explicit approval.
- Treat `main` as the integration source of truth. Start new sprint branches from current `main`.
- Avoid unrelated cleanup in a focused sprint; capture follow-up work in the backlog instead.

## TypeScript and React
- Keep TypeScript strict and avoid `any` unless an external boundary makes it unavoidable and the reason is documented.
- Prefer typed pure helpers for reusable calculations, parsing, state transitions, command construction, and validation.
- Keep React components focused on presentation and orchestration; extract growing business logic into tested modules.
- Prefer immutable state updates.
- Use descriptive domain names rather than abbreviations for exported APIs.
- Keep browser-only APIs behind client/runtime boundaries and guard server-side execution where required.
- Preserve accessible names, labels, roles, keyboard behavior, focus behavior, and disabled states when changing UI controls.
- Do not introduce a dependency when a small maintainable implementation using existing platform/project capabilities is sufficient.

## Formatting and linting
- Follow the repository ESLint and TypeScript configuration.
- Match surrounding code style when editing an existing file; avoid formatting unrelated code.
- Remove dead imports, unreachable branches, stale comments, and debugging output before merge.
- Comments should explain constraints or non-obvious intent, not restate the code.

## Error handling
- Surface actionable errors at the boundary where a user or developer can act on them.
- Preserve useful lower-level diagnostics instead of replacing them with generic failure text.
- Do not silently swallow failures unless the operation is explicitly best-effort; document intentional fallbacks.
- Validate external, persisted, browser, and file-derived data before trusting it.

## Tests
Every behavior change should have the smallest useful regression coverage.

- Pure logic: focused unit tests.
- Components/interactions: Testing Library tests with accessible queries.
- Browser/runtime behavior that cannot be represented faithfully in jsdom: applicable Playwright/browser checks.
- Bug fixes: add a regression test that fails for the prior behavior whenever practical.
- Test observable behavior and contracts rather than implementation details.
- Keep fixtures minimal and deterministic.
- Do not weaken or delete a failing test merely to make CI green; update it only when the intended contract changed.

## Required validation
Before merge, run or obtain green CI for the applicable repository gates:

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npm run build
```

Production dependency audit and applicable specialized/security/browser checks must also pass. A failing pipeline is part of the active sprint and should be fixed on the same branch before merge.

## Git and pull requests
- Use a short-lived branch named for the sprint or focused fix, for example `feature/sprint-61-description`, `fix/export-description`, or `docs/description`.
- Use concise imperative commit messages such as `feat: add clip queue reordering`, `fix: preserve source container`, or `test: cover export fallback`.
- Keep commits scoped enough to explain why a change exists.
- Pull requests must state the problem/outcome, meaningful implementation changes, acceptance criteria, validation target/results, and important constraints/non-goals.
- Do not stack the next sprint on an unmerged sprint unless there is an explicit reason to do so.
- Resolve merge conflicts against current `main` without discarding newer behavior or tests.

## Documentation synchronization
Documentation is part of the implementation, not a later cleanup task.

For every sprint:
1. Mark the previously merged sprint complete in `IMPROVEMENT_ROADMAP.md`.
2. Record the active sprint goal and testable acceptance criteria.
3. Keep `PRODUCT_BACKLOG.md` aligned with current priority/state.
4. Update README/user/operational documentation when commands, configuration, workflow, or visible behavior changes.
5. Update these standards or the Agile model when the development process itself changes.
6. Capture newly discovered follow-up work in the backlog instead of silently expanding scope.

A sprint is not complete if its documentation describes stale behavior.

## Architecture and maintainability
- Prefer dependency direction from UI/orchestration toward typed domain helpers.
- Keep persistence formats versioned and backward-compatible when practical.
- Keep media-processing command construction deterministic and independently testable where possible.
- Revoke browser object URLs and clean temporary FFmpeg files/resources.
- Avoid unnecessary parallel media processing that increases browser memory pressure.
- Preserve privacy boundaries: local source video and transcript contents should not leave the browser unless a future approved feature explicitly says otherwise.

## Security and secrets
- Never commit credentials, tokens, private keys, real secrets, or production-only values.
- Public browser configuration must be safe to expose; `NEXT_PUBLIC_*` values are compiled into client assets.
- Keep secrets in environment/configuration mechanisms intended for them.
- Treat dependency audit/Snyk findings as actionable sprint work when they affect the changed code or supported runtime.
- Do not reactivate dormant AWS deployment automation without explicit approval.

## Definition of a maintainable change
A change is maintainable when another developer can determine:
- what problem it solves;
- where the behavior lives;
- what contract/tests protect it;
- how to validate it locally;
- what configuration or operational assumptions it has; and
- what follow-up work remains.

If those answers are unclear, improve the code, tests, PR description, or documentation before merge.
