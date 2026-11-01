import { test, expect } from '@playwright/test';

test('index lists all 7 events, upcoming first', async ({ page }) => {
  await page.goto('/events/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.event-card')).toHaveCount(7);
  await expect(page.locator('#upcoming .event-card')).toHaveCount(3);
});

test('past events are grouped by semester, newest first', async ({ page }) => {
  await page.goto('/events/');
  await expect(page.locator('#past h3.sem')).toHaveText(['Odd Sem 2026', 'Even Sem 2026']);
});

test('filtering by Talk leaves only talk cards visible', async ({ page }) => {
  await page.goto('/events/');
  await page.getByRole('button', { name: 'Talk' }).click();
  await expect(page.getByRole('button', { name: 'Talk' })).toHaveAttribute('aria-pressed', 'true');
  const visible = page.locator('.event-card:visible');
  await expect(visible).toHaveCount(2);
  for (const card of await visible.all()) await expect(card).toHaveAttribute('data-type', 'talk');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('filter chips are hidden and every event shows', async ({ page }) => {
    await page.goto('/events/');
    await expect(page.locator('.filters')).toBeHidden();
    await expect(page.locator('.event-card:visible')).toHaveCount(7);
  });
});

test('upcoming event detail has a Register link', async ({ page }) => {
  await page.goto('/events/2026-11-15-linux-install-fest/');
  await expect(page.locator('h1')).toHaveText('Linux Install Fest');
  await expect(page.getByRole('link', { name: /register/i })).toHaveAttribute('href', 'https://forms.gle/REPLACE-ME');
  await expect(page.locator('.happened')).toHaveCount(0);
});

test('past event without photos shows the badge, no register, no gallery', async ({ page }) => {
  await page.goto('/events/2026-02-07-software-freedom-meetup/');
  await expect(page.locator('.happened')).toHaveText(/it happened/i);
  await expect(page.getByRole('link', { name: /register/i })).toHaveCount(0);
  await expect(page.locator('.gallery')).toHaveCount(0);
});

test('past event with photos shows the gallery with alt text', async ({ page }) => {
  await page.goto('/events/2026-10-10-hacktoberfest-kickoff/');
  await expect(page.locator('.gallery img')).toHaveCount(2);
  await expect(page.locator('.gallery img').first()).toHaveAttribute('alt', /Hacktoberfest/);
});

test('unknown event slug returns 404', async ({ page }) => {
  const res = await page.goto('/events/does-not-exist/');
  expect(res?.status()).toBe(404);
});
