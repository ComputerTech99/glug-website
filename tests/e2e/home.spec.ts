import { test, expect } from '@playwright/test';

// The site is built with GLUG_NOW=2026-11-01 (see playwright.config.ts) so seed data splits deterministically.
test('upcoming shows the 3 next events in date order', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#upcoming .event-card h3');
  await expect(cards).toHaveText(['Linux Install Fest', 'Git Beyond Commit', 'Introduction to Containerization & Orchestration Fundamentals']);
});

test('archive shows the 4 latest past events', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#archive .event-card')).toHaveCount(4);
  await expect(page.locator('#archive').getByRole('link', { name: /all past events/i })).toHaveAttribute('href', '/events/');
});

test('event without a poster renders the typographic fallback', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.event-card', { hasText: 'Software Freedom Meetup' });
  await expect(card.locator('.poster-fallback')).toBeVisible();
  await expect(card.locator('img')).toHaveCount(0);
});

test('join CTA links to /join/', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#join-cta').getByRole('link', { name: /join glug/i })).toHaveAttribute('href', '/join/');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('stats show final numbers', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.stats')).toContainText('120+');
  });
});

test('no upcoming events shows the empty state', async ({ page }) => {
  await page.goto('http://localhost:4322/');
  await expect(page.locator('#upcoming')).toContainText('Nothing scheduled right now');
  await expect(page.locator('#upcoming').getByRole('link', { name: /linkedin/i })).toBeVisible();
  await expect(page.locator('#upcoming .event-card')).toHaveCount(0);
});
