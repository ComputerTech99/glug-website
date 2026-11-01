import { test, expect } from '@playwright/test';

test('ticker sits on an ink band to separate it from the page', async ({ page }) => {
  await page.goto('/');
  const bg = await page.locator('.ticker').evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).toBe('rgb(20, 20, 20)');
});

for (const width of [1440, 1280, 1024]) {
  test(`stat numbers never touch each other at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const boxes = await page.locator('.stats dd').evaluateAll((els) =>
      els.map((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        const b = r.getBoundingClientRect();
        return { left: b.left, right: b.right, top: b.top };
      }),
    );
    for (let i = 1; i < boxes.length; i++) {
      if (boxes[i].top !== boxes[i - 1].top) continue; // wrapped to a new row
      expect(boxes[i].left - boxes[i - 1].right, `gap between stat ${i} and ${i + 1}`).toBeGreaterThanOrEqual(24);
    }
  });
}

test('no doubled gap between the archive and the join block on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 412, height: 924 });
  await page.goto('/');
  const gap = await page.evaluate(() => {
    const link = document.querySelector('#archive .more')!.getBoundingClientRect();
    const cta = document.querySelector('#join-cta')!.getBoundingClientRect();
    return cta.top - link.bottom;
  });
  expect(gap).toBeLessThanOrEqual(160);
});
