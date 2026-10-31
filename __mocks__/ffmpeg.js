// FFmpeg.wasm is browser-only; unit tests exercise the editor's pure helpers.
// Runtime behavior is covered by the separate caption and Docker smoke checks.
class FFmpeg {
  constructor() {
    throw new Error('FFmpeg browser runtime is not available in Jest unit tests.');
  }
}
module.exports = { FFmpeg };
