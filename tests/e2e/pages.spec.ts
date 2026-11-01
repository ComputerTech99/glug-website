import { test, expect } from '@playwright/test';

for (const path of ['/about/', '/team/', '/resources/', '/join/']) {
  test(`${path} renders with exactly one h1`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}

test('about has the timeline and links to FSMK', async ({ page }) => {
  await page.goto('/about/');
  await expect(page.locator('.timeline li')).toHaveCount(3);
  await expect(page.locator('a[href="https://fsmk.org"]').first()).toBeVisible();
});

test('team shows 3 current members and 1 alumnus', async ({ page }) => {
  await page.goto('/team/');
  await expect(page.locator('#current .team-card')).toHaveCount(3);
  await expect(page.locator('#alumni .team-card')).toHaveCount(1);
  await expect(page.locator('#current .team-card h3').first()).toHaveText('Lead Name');
  await expect(page.locator('#current .team-card img').first()).toHaveAttribute('alt', 'Lead Name');
});

test('resources lists every topic from the YAML', async ({ page }) => {
  await page.goto('/resources/');
  await expect(page.locator('main h2')).toHaveText(['Linux basics', 'Git & GitHub', 'Contributing to open source']);
  await expect(page.locator('.level').first()).toHaveText(/beginner/i);
});

test('join buttons point at the configured URLs', async ({ page }) => {
  await page.goto('/join/');
  await expect(page.getByRole('link', { name: /fill the form/i })).toHaveAttribute('href', 'https://forms.gle/REPLACE-ME');
  await expect(page.getByRole('link', { name: /join the chat/i })).toHaveAttribute('href', 'https://chat.whatsapp.com/REPLACE-ME');
});

test('unknown page shows the terminal 404', async ({ page }) => {
  const res = await page.goto('/nope/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('command not found');
  await expect(page.getByRole('link', { name: 'cd ~' })).toHaveAttribute('href', '/');
});
