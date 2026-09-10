# Sprint 22 security notes

Batch ZIP creation is local-only. Generated MP4 files are never uploaded for packaging. Archive entry names remove path separators/control characters and are case-insensitively de-duplicated before writing, preventing accidental nested paths or ambiguous duplicate names inside the archive.

No new third-party dependency is added, so this sprint does not expand the npm supply-chain surface. Existing production dependency audit and Snyk checks remain unchanged.
