import { expect, test } from '@playwright/test';

test('self-hosted FFmpeg runtime can encode a generated caption overlay', async ({ page }) => {
  await page.goto('/');

  const result = await page.evaluate(async () => {
    const [{ createFFmpeg }, burnIn] = await Promise.all([
      import('@ffmpeg/ffmpeg'),
      import('../src/components/video-editor/captionBurnIn'),
    ]);

    const ffmpeg = createFFmpeg({
      log: false,
      corePath: new URL('/ffmpeg/ffmpeg-core.js', window.location.origin).href,
    });
    await ffmpeg.load();

    const overlayName = 'caption-runtime-smoke.png';
    const outputName = 'caption-runtime-smoke.mp4';

    try {
      const overlay = await burnIn.renderCaptionOverlay(
        { start: 0, end: 0.25, text: 'Caption check' },
        { size: 'small', position: 'bottom', backdrop: true },
        320,
        180,
        0,
      );
      ffmpeg.FS('writeFile', overlayName, overlay.bytes);
      await ffmpeg.run(
        '-f', 'lavfi', '-i', 'color=c=black:s=320x180:r=10:d=0.25',
        '-i', overlayName,
        '-filter_complex', "[0:v]setpts=PTS-STARTPTS[v0];[1:v]format=rgba,setpts=PTS-STARTPTS[cap0];[v0][cap0]overlay=0:0:enable='between(t,0,0.25)'[v1]",
        '-map', '[v1]', '-an', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-t', '0.25', '-y', outputName,
      );
      const output = ffmpeg.FS('readFile', outputName);
      return { loaded: ffmpeg.isLoaded(), outputBytes: output.length };
    } finally {
      for (const name of [overlayName, outputName]) {
        try { ffmpeg.FS('unlink', name); } catch { /* best-effort cleanup */ }
      }
      ffmpeg.exit();
    }
  });

  expect(result.loaded).toBe(true);
  expect(result.outputBytes).toBeGreaterThan(0);
});
