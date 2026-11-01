import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/events/', '/events/2026-12-06-containers-workshop/', '/events/2026-02-07-software-freedom-meetup/', '/about/', '/team/', '/resources/', '/join/', '/nope/'];
const WIDTHS = [320, 390, 768, 1440];

for (const width of WIDTHS) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ROUTES) {
      await page.goto(route);
      const [scroll, inner] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      expect(scroll, `${route} at ${width}px`).toBeLessThanOrEqual(inner);
    }
  });
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('footer navigation works and content is complete', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.stats')).toContainText('120+');
    await page.locator('footer').getByRole('link', { name: 'Events' }).click();
    await expect(page).toHaveURL(/\/events\/$/);
    await expect(page.locator('.event-card:visible')).toHaveCount(7);
  });
});

test('every page has canonical, description and OG image', async ({ page }) => {
  for (const route of ROUTES.filter((r) => r !== '/nope/')) {
    await page.goto(route);
    await expect(page.locator('link[rel="canonical"]'), route).toHaveAttribute('href', /^https:\/\//);
    await expect(page.locator('meta[name="description"]'), route).toHaveAttribute('content', /.{20,}/);
    await expect(page.locator('meta[property="og:image"]'), route).toHaveAttribute('content', /^https:\/\/.+\.(png|jpg|jpeg|webp)/);
    await expect(page.locator('meta[name="twitter:card"]'), route).toHaveAttribute('content', 'summary_large_image');
  }
});

test('event page OG image is its poster', async ({ page }) => {
  await page.goto('/events/2026-11-15-linux-install-fest/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /install-fest/);
});

test('sitemap and robots exist', async ({ request }) => {
  expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap:');
});

test('keyboard focus outline is contrast-safe on light backgrounds', async ({ page }) => {
  await page.goto('/about/');
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab'); // brand link (on paper)
  const color = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineColor);
  expect(color).toBe('rgb(199, 58, 10)'); // --sig-text, 4.61:1 on paper
});
