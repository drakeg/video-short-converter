# Sprint 22 validation plan

Automated validation must confirm:

- standard TypeScript, ESLint, Jest, and production build gates remain green;
- production dependency audit remains green;
- ZIP helper tests verify CRC-32, sanitized/de-duplicated names, archive naming, ZIP local/central/end signatures, and empty-batch rejection;
- Clip Queue UI tests distinguish one-clip direct export from multi-clip ZIP export;
- no AWS deployment or paid service is introduced.

Because this sprint does not change FFmpeg runtime assets or caption rendering, the specialized caption-runtime smoke workflow should only run if its existing path filters match a touched dependency/runtime path.
