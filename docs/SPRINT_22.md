# Sprint 22 - Single-download batch ZIP export

## Goal
Reduce browser download friction for multi-clip batches by replacing multiple automatic downloads with one browser-generated archive.

## Acceptance criteria
- A one-clip queue still downloads a normal MP4.
- A queue with two or more clips downloads one ZIP containing every generated MP4.
- Clip rendering remains sequential and honors each clip's saved export settings.
- ZIP entry names are sanitized and duplicate names are made unique.
- ZIP packaging runs entirely in-browser and adds no npm dependency, cloud service, AWS resource, or paid service.
- Unsupported ZIP32-size batches fail with an actionable message.
- Unit tests cover archive structure and naming behavior.
- Standard CI remains green.
