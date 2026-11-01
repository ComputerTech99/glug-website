import { test, expect } from '@playwright/test';

const INK = 'rgb(20, 20, 20)';
const WHITE = 'rgb(255, 255, 255)';
const bg = (page: import('@playwright/test').Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => getComputedStyle(el).backgroundColor);

test('home: what-we-do + stats sit on one ink band', async ({ page }) => {
  await page.goto('/');
  expect(await bg(page, '#what')).toBe(INK);
  await expect(page.locator('#what .stats')).toHaveCount(1);
});

for (const path of ['/', '/about/', '/events/2026-11-15-linux-install-fest/']) {
  test(`footer is ink on ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await bg(page, '.site-footer-band')).toBe(INK);
  });
}

for (const path of ['/events/', '/about/', '/team/', '/resources/', '/join/', '/events/2026-11-15-linux-install-fest/', '/nope/']) {
  test(`inner page header and nav are ink on ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await bg(page, '.page-top')).toBe(INK);
    expect(await bg(page, '.site-nav-band')).toBe(INK);
    await expect(page.locator('.page-top h1')).toHaveCount(1);
  });
}

test('home nav stays on cream', async ({ page }) => {
  await page.goto('/');
  expect(await bg(page, '.site-nav-band')).not.toBe(INK);
});

test('past cards are ink, upcoming cards stay white', async ({ page }) => {
  await page.goto('/');
  expect(await bg(page, '#archive .event-card')).toBe(INK);
  expect(await bg(page, '#upcoming .event-card')).toBe(WHITE);
  await page.goto('/events/');
  expect(await bg(page, '#past .event-card')).toBe(INK);
  expect(await bg(page, '#upcoming .event-card')).toBe(WHITE);
});
