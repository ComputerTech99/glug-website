import { test, expect } from '@playwright/test';

test('home renders hero h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText(/free/i);
  await expect(page).toHaveTitle(/GLUG/);
});
