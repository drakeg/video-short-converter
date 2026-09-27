import { expect, test } from '@playwright/test';

test('local transcription benchmark stays disabled without the developer flag', async ({ page }) => {
  await page.goto('/transcription-benchmark/');
  await expect(page.getByTestId('benchmark-capability')).toHaveText('Local transcription prototype is disabled.');
  await expect(page.getByRole('button', { name: 'Run local benchmark' })).toBeDisabled();
  await expect(page.getByTestId('benchmark-status')).toHaveText('idle');
});
