# Agile Project Operating Model

## Product vision
Video Shorts Editor helps creators turn local source video into social-ready clips in the browser while keeping media processing local, predictable, and inexpensive.

## Product principles
- Keep the creator in control of clip selection, timing, framing, captions, audio, and export.
- Prefer local/browser execution over cloud processing when practical.
- Do not activate AWS infrastructure or recurring paid services without explicit approval.
- Make incremental, reviewable changes with automated validation.
- Protect recovery, export, and compatibility behavior with focused regression tests.
- Keep specialized CI path-scoped when possible so normal pull requests remain fast.

## Roles
This repository is maintained as a small-owner Agile project.

- **Product Owner:** repository owner; prioritizes product value, scope, and cost constraints.
- **Development:** implement, test, document, and review each increment.
- **CI/CD:** GitHub Actions, Vercel preview validation, and security tooling provide automated quality gates.
- **Users:** creator workflow feedback drives backlog refinement.

## Cadence
Work is organized as small numbered sprints. A sprint should normally produce one cohesive pull request that can be reviewed and merged independently.

Each sprint follows:
1. **Refine** — identify the problem, user value, constraints, dependencies, and acceptance criteria.
2. **Plan** — select a small increment from the prioritized backlog.
3. **Implement** — make the smallest maintainable change that satisfies the acceptance criteria.
4. **Validate** — run applicable automated checks and focused regression tests.
5. **Review** — summarize behavior, scope, risks, and validation in the pull request.
6. **Close** — update roadmap/backlog status after merge and identify the next increment.

## Repository standards
All implementation work follows [DEVELOPMENT_STANDARDS.md](DEVELOPMENT_STANDARDS.md). Coding, testing, Git/PR, security, documentation synchronization, and maintainability rules are part of the sprint quality gate rather than optional follow-up work.

## Definition of Ready
A backlog item is ready when:
- the user/problem statement is clear;
- acceptance criteria are testable;
- major dependencies and constraints are known;
- cost implications are understood;
- the item is small enough for one reviewable sprint or has been split;
- expected CI/test impact is understood.

## Definition of Done
A sprint is done when:
- acceptance criteria are satisfied;
- TypeScript, ESLint, unit tests, production build, production dependency audit, and applicable specialized checks pass;
- new behavior has focused automated coverage where practical;
- compatibility with existing local-only workflows is preserved or intentionally documented;
- no AWS resource or recurring paid service is activated unless explicitly approved;
- user-facing or operational documentation is updated when behavior changes;
- the roadmap/backlog reflects the merged result;
- coding and contribution standards remain satisfied and are updated when the engineering process changes;
- the pull request clearly states scope, validation, and any follow-up work.

## Backlog policy
The prioritized backlog lives in [PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md). Items are ordered by value/risk and can be re-ranked during refinement. The improvement roadmap records completed sprints and near-term direction; it is not a substitute for the active backlog.

Backlog item states:
- **Ready** — refined enough to enter a sprint.
- **Planned** — selected for the next sprint.
- **In progress** — implementation PR open.
- **Blocked** — cannot proceed without an external decision/dependency.
- **Done** — merged and verified.
- **Deferred** — intentionally postponed.

## Acceptance criteria style
Prefer observable statements, for example:
- Given a saved project with queued clips, when recovery metadata is created, then later mutations to the live queue do not alter the retained recovery snapshot.
- Given a pull request that changes caption runtime code, when CI runs, then the specialized browser caption gate executes.

Avoid implementation-only criteria unless the implementation choice is itself a requirement.

## Risk management
Current standing risks and controls:

| Risk | Impact | Control |
| --- | --- | --- |
| Browser memory pressure during video processing | Export failure/crash | Sequential FFmpeg processing, validation, targeted warnings |
| Recovery schema regressions | Lost or invalid edits | Backward-compatible parsing, validation, focused tests |
| Oversized editor component | Slower maintenance, higher regression risk | Continue extracting pure typed helpers |
| Dependency/security drift | Build/runtime exposure | Locked installs, production audit, Snyk, Renovate policy |
| Expensive CI | Slow iteration | Path-scope specialized browser/runtime checks |
| Unplanned cloud cost | Recurring spend | AWS remains dormant; paid/cloud work requires explicit approval |
| Browser/runtime compatibility | Feature failures | Runtime capability checks and real-browser coverage for critical paths |

## Technical debt policy
Technical debt is tracked in the product backlog and should be addressed when it materially affects reliability, delivery speed, testability, or user experience. Refactors should preserve behavior unless the sprint explicitly includes a behavior change.

## Sprint review checklist
Before merge:
- Does the PR solve the stated problem?
- Are acceptance criteria demonstrably met?
- Are regression tests focused on the changed behavior?
- Did scope creep introduce unrelated work?
- Are cost/privacy/local-processing constraints still satisfied?
- Are roadmap and backlog statuses current?
- Are follow-up risks or debt captured rather than hidden?
