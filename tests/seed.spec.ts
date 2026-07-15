import { test } from '@playwright/test';

test('seed', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4321/');
});
