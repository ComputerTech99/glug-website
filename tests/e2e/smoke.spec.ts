import { test, expect } from '@playwright/test';

test('home renders hero h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText(/free/i);
  await expect(page).toHaveTitle(/GLUG/);
});

test('hero shows the traced full logo', async ({ page }) => {
  await page.goto('/');
  const logo = page.locator('.hero svg.logo--full');
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute('aria-label', /Linux Users Group/);
});
