import { expect, test } from '@playwright/test';

test('self-hosted FFmpeg runtime can encode a generated caption overlay', async ({ page }) => {
  await page.goto('/runtime-smoke/');
  await expect(page.getByTestId('runtime-status')).toHaveText('idle');

  await page.getByRole('button', { name: 'Run caption runtime check' }).click();

  await expect(page.getByTestId('runtime-status')).toHaveText('passed', { timeout: 30_000 });
});
