import { test, expect } from '@playwright/test';

test.describe('logo intro', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('plays on the first page of a visit, then reveals the page', async ({ page }) => {
    await page.goto('/');
    const intro = page.locator('.intro-overlay');
    await expect(intro).toBeVisible();
    await expect(intro.locator('svg.logo--full')).toBeVisible();
    await expect(intro).toBeHidden({ timeout: 5000 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('does not replay when navigating within the same visit', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.intro-overlay')).toBeHidden({ timeout: 5000 });
    await page.goto('/events/');
    await expect(page.locator('.intro-overlay')).toBeHidden();
    expect(await page.evaluate(() => document.documentElement.classList.contains('intro'))).toBe(false);
  });

  test('tapping the intro skips it', async ({ page }) => {
    await page.goto('/');
    await page.locator('.intro-overlay').click();
    await expect(page.locator('.intro-overlay')).toBeHidden({ timeout: 1000 });
  });
});

test('reduced motion never shows the intro', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.intro-overlay')).toBeHidden();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'no-preference' });
  test('never shows the intro', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.intro-overlay')).toBeHidden();
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('phone hero', () => {
  test.use({ viewport: { width: 412, height: 924 } });
  test('hides the Tux card and scales the headline up', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero .tux-card')).toBeHidden();
    const size = await page.locator('.hero h1').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeGreaterThanOrEqual(68);
  });
});

test('desktop hero still shows the Tux card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.hero .tux-card')).toBeVisible();
});
