# Batch ZIP Export

Queued clips are rendered sequentially with the existing browser-local FFmpeg pipeline. When a batch contains two or more clips, the generated MP4 files are packaged into one ZIP archive before download.

## Why stored ZIP entries

MP4 is already compressed, so attempting to deflate each clip adds CPU cost with little size benefit. The ZIP writer therefore uses the standard `stored` method and writes each generated `File` directly into the archive Blob.

## Memory behavior

- FFmpeg rendering remains sequential.
- CRC-32 is calculated from each file stream where `Blob.stream()` is available.
- The ZIP Blob references the generated `File` objects instead of first copying all clip bytes into another combined `Uint8Array`.
- ZIP32 limits are enforced. Batches that exceed the supported size return an actionable error instructing the user to export fewer clips at a time.

## Download behavior

- One queued clip downloads directly as MP4.
- Two or more clips download as `<source>-clips.zip`.
- ZIP entry names are path-sanitized and case-insensitively de-duplicated.

No clip bytes leave the browser as part of ZIP packaging, and no cloud storage or paid service is required.
