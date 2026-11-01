import { test, expect } from '@playwright/test';

const PAGES = ['/events/', '/about/', '/team/', '/resources/', '/join/'];

test.describe('mobile nav', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('menu button toggles the overlay and Esc returns focus', async ({ page }) => {
    await page.goto('/');
    const btn = page.getByRole('button', { name: /menu/i });
    await expect(btn).toBeVisible();
    await expect(page.locator('.nav-links')).toBeHidden();

    await btn.click();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    const overlay = page.locator('#mobile-menu');
    await expect(overlay).toBeVisible();
    await expect(overlay.getByRole('link', { name: 'Events' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(overlay).toBeHidden();
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    await expect(btn).toBeFocused();
  });
});

test.describe('desktop nav', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('desktop links are visible and menu button hidden', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-links').getByRole('link', { name: 'Events' })).toBeVisible();
    await expect(page.getByRole('button', { name: /menu/i })).toBeHidden();
  });
});

test('footer links to every page', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  for (const href of PAGES) await expect(footer.locator(`a[href="${href}"]`)).toHaveCount(1);
  await expect(footer).toContainText('GPL-3.0');
});
