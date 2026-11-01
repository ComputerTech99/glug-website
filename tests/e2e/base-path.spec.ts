import { test, expect } from '@playwright/test';

// Built with base '/glug-website/' — the GitHub Pages project URL.
const ORIGIN = 'http://localhost:4523';
const BASE = '/glug-website/';

test('every internal link, image and icon stays under the base path and loads', async ({ page, request }) => {
  const queue = [BASE];
  const seen = new Set<string>();
  const assets = new Set<string>();

  while (queue.length) {
    const path = queue.shift()!;
    if (seen.has(path)) continue;
    seen.add(path);
    const res = await page.goto(ORIGIN + path);
    expect(res?.status(), path).toBe(200);

    const refs = await page.evaluate(() => {
      const abs = (u: string) => new URL(u, location.href);
      const local = (u: URL) => u.origin === location.origin;
      const links = [...document.querySelectorAll<HTMLAnchorElement>('a[href]')].map((a) => abs(a.getAttribute('href')!)).filter(local).map((u) => u.pathname);
      const files = [
        ...[...document.querySelectorAll<HTMLImageElement>('img[src]')].map((i) => i.getAttribute('src')!),
        ...[...document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="sitemap"]')].map((l) => l.getAttribute('href')!),
      ].map(abs).filter(local).map((u) => u.pathname);
      const og = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      return { links, files, og };
    });

    for (const l of refs.links) {
      expect(l, `link on ${path}`).toMatch(new RegExp(`^${BASE}`));
      if (!seen.has(l)) queue.push(l);
    }
    for (const f of refs.files) {
      expect(f, `asset on ${path}`).toMatch(new RegExp(`^${BASE}`));
      assets.add(f);
    }
    if (refs.og) expect(new URL(refs.og).pathname, `og:image on ${path}`).toMatch(new RegExp(`^${BASE}`));
  }

  expect(seen.size).toBeGreaterThanOrEqual(13); // 6 linked pages + 7 events (404 is not linked)
  for (const a of assets) expect((await request.get(ORIGIN + a)).status(), a).toBe(200);
  const robots = await (await request.get(ORIGIN + BASE + 'robots.txt')).text();
  expect(robots).toContain(`${BASE}sitemap-index.xml`);
});
