# Sprint 22 implementation notes

The batch archive writer uses classic ZIP32 with the `stored` compression method. This keeps the implementation dependency-free and avoids recompressing MP4 data. The archive uses UTF-8 entry names and fixed DOS timestamps, which keeps metadata simple and deterministic.

The implementation intentionally does not introduce Zip64. If an individual clip or combined archive would exceed ZIP32 limits, the user receives an actionable error asking them to export fewer clips at a time. This is preferable to silently producing a corrupt archive.
