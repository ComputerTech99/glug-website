# GLUG FET-JU Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the static GLUG FET-JU website (Home, Events, Event detail, About, Team, Resources, Join, 404) in the "ink-led poster" style, driven by Markdown/YAML content files.

**Architecture:** Astro static site. Content lives in Astro content collections (`src/content/events`, `src/content/team`) validated by Zod, plus small data files in `src/data`. Pure logic (upcoming/past split, semester grouping) lives in `src/lib/events.ts` and is unit-tested; pages/components are verified by Playwright smoke tests and Lighthouse.

**Tech Stack:** Node 24, Astro 7.x (`npm create astro@latest`, minimal template, TypeScript strict), `@fontsource/inter-tight`, `@fontsource/jetbrains-mono`, `@astrojs/sitemap`, `yaml` (via Astro's `file()` loader or `import`), Vitest, Playwright, `@lhci/cli`, Cloudflare Pages, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-01-glug-website-design.md` — read it before starting any task; §3 (visual) and §5 (content model) are normative.

## Global Constraints

- Colour tokens exactly: `--paper #F4F1EA`, `--ink #141414`, `--muted rgb(20 20 20 / .6)`, `--line rgb(20 20 20 / .12)`, `--sig #FF5A1F`, `--white #FFFFFF`. No other colours.
- Orange (`--sig`) never used for small body text; only large/bold text, buttons, numbers, markers, tags.
- Fonts: Inter Tight 400/500/700/900 (display/body), JetBrains Mono 400/600 (labels/nav/buttons/meta), self-hosted via `@fontsource`. No runtime Google Fonts.
- Headlines: weight 900, uppercase, letter-spacing −0.06em, line-height 0.86, fluid `clamp()`.
- Cards/buttons: 2px `--ink` border + hard offset shadow (5–8px, 0 blur). Hover: `translate(-3px,-3px)` with larger shadow.
- Spacing: section padding `clamp(96px,16vh,180px)` block; gutter `clamp(20px,6vw,96px)`; max width 1360px.
- No CSS framework. Component-scoped `<style>`; shared tokens in `src/styles/tokens.css`.
- Every animation disabled under `@media (prefers-reduced-motion: reduce)`.
- Site fully usable with JS disabled; JS only enhances (stats count-up, events filter, mobile menu).
- "Today" is evaluated in **Asia/Kolkata**, not the build machine's timezone.
- Site licence GPL-3.0 (`LICENSE` file + footer line).
- No horizontal scroll at 320, 390, 768, 1440px.
- Lighthouse mobile ≥ 90 for Performance, Accessibility, Best Practices, SEO on `/` and one event page.

## Review Focus

1. **Event on the build day / timezone** — an event dated today (IST) must be "upcoming" even though Cloudflare builds in UTC. Test in Task 3.
2. **Huge uppercase headings overflowing at 320px** — long words ("INSTALLFEST", long event titles) must wrap, not scroll the page. Test in Task 9 (overflow at 320px on an event with a long title in seed data).
3. **No upcoming events** — homepage and `/events` show the empty-state message with LinkedIn link, never an empty grid. Test in Task 3 (lib) and Task 6 (render via fixture date).
4. **Past event without poster or photos** — card shows typographic fallback; detail page hides gallery and register button. Test in Task 6.
5. **JS disabled** — all nav links reachable (footer repeats them), filter shows all events, stats show final numbers. Test in Task 9 (Playwright with `javaScriptEnabled: false`).

---

## File Structure

```
astro.config.mjs            site URL, sitemap integration
src/content.config.ts       events + team collections (Zod)
src/content/events/*.md     seed events (+ poster images beside them)
src/content/team/*.md       seed team (+ photos)
src/data/site.ts            SITE constant
src/data/resources.yaml     resource topics
src/data/timeline.yaml      history
src/lib/events.ts           pure date/grouping logic
src/lib/events.test.ts      Vitest
src/styles/tokens.css       tokens + @font-face imports
src/styles/base.css         reset, body, focus, reduced-motion, .wrap, .grid-bg, .mono, .lbl
src/assets/logo.svg         traced Tux
src/components/             Nav, Footer, Button, SectionHead, Ticker, EventCard, Stats, TeamCard, Logo
src/layouts/Base.astro      <head>, meta/OG, Nav, slot, Footer
src/pages/                  index, events/index, events/[slug], about, team, resources, join, 404
public/                     favicon.svg, og-default.png, robots.txt
tests/e2e/*.spec.ts         Playwright
.github/workflows/          ci.yml, daily-rebuild.yml
lighthouserc.json, README.md, LICENSE
```

---

### Task 1: Scaffold, design tokens, base layout

**Files:**
- Create: Astro project at repo root (`package.json`, `astro.config.mjs`, `tsconfig.json`), `src/styles/tokens.css`, `src/styles/base.css`, `src/layouts/Base.astro`, `src/pages/index.astro` (temporary hero only), `playwright.config.ts`, `vitest.config.ts`, `tests/e2e/smoke.spec.ts`, `LICENSE` (GPL-3.0 text)

**Interfaces:**
- Produces: `Base.astro` props `{ title: string; description: string; ogImage?: string }`; global classes `.wrap`, `.grid-bg`, `.mono`, `.lbl` (mono 12px, tracking .08em, `--muted`; child `<i>` styled orange, no italics), `.h-display` (headline style from Global Constraints); npm scripts `dev`, `build`, `check` (`astro check`), `test` (`vitest run`), `e2e` (`playwright test`, webServer = `npm run build && npm run preview`).

- [ ] **Step 1:** `npm create astro@latest . -- --template minimal --typescript strict --install --no-git --skip-houston`; then `npm i @fontsource/inter-tight @fontsource/jetbrains-mono && npm i -D vitest @playwright/test && npx playwright install chromium`.
- [ ] **Step 2: Write failing smoke test** `tests/e2e/smoke.spec.ts`:
```ts
test('home renders hero h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText(/free/i);
  await expect(page).toHaveTitle(/GLUG/);
});
```
- [ ] **Step 3:** Run `npm run e2e` → FAIL (minimal template has no h1 "free").
- [ ] **Step 4:** Implement tokens.css, base.css (body bg `--paper`, ink text, focus `outline:2px solid var(--sig); outline-offset:3px`, global reduced-motion rule setting `animation:none; transition:none` on `*`), Base.astro, and index.astro with hero copy `FREE / AS IN / FREEDOM.` ("FREEDOM." in `--sig`), label `// GNU/LINUX USERS GROUP — FET, JAIN UNIVERSITY`. Use `overflow-wrap:anywhere` on `.h-display`.
- [ ] **Step 5:** `npm run check && npm run e2e` → PASS.
- [ ] **Step 6:** Commit `feat: scaffold Astro site with tokens and base layout`.

### Task 2: Logo SVG and favicon

**Files:**
- Create: `src/assets/logo.svg`, `src/components/Logo.astro`, `public/favicon.svg`
- Source: `/private/tmp/claude-501/-Users-ojashkgupta-Projects-glug-website/6ed3f29e-7348-4cad-bba8-ffbe86240299/images/1.png` (ask the user for the original if this path is gone)

**Interfaces:**
- Produces: `<Logo variant="full" | "mark" class?: string animate?: boolean />`. `full` = Tux + "Linux Users Group" text; `mark` = Tux head only (nav, favicon). Fills use `currentColor`; white areas use `var(--white)`. `animate` adds a stroke draw-in (`stroke-dasharray` + keyframes, ~1.2s) honoring reduced motion.

- [ ] **Step 1:** Trace the PNG into SVG paths (manually or `potrace` via `brew install potrace`: convert to PBM with `sips`/ImageMagick, `potrace -s`), then hand-clean: transparent background, viewBox tight to artwork, text as `<text>` in JetBrains Mono or as paths (paths preferred so it never depends on font loading). Target < 15 KB.
- [ ] **Step 2:** Visual check: render `Logo` on index at 260px and 32px; screenshot via Playwright and compare against the source PNG by eye — silhouette, eyes, beak and text must be recognisably the same.
- [ ] **Step 3:** Put `<Logo variant="full" animate />` in the hero card (white card, 2px border, 8px shadow, ~260px wide desktop / 180px mobile) and `mark` in nav placeholder; `favicon.svg` from `mark`.
- [ ] **Step 4:** `npm run check && npm run e2e` → PASS. Commit `feat: add traced Tux logo SVG and favicon`.

### Task 3: Event logic (`src/lib/events.ts`) — TDD

**Files:**
- Create: `src/lib/events.ts`, `src/lib/events.test.ts`

**Interfaces:**
- Produces (generic over anything with `data.date: Date` and optional `data.endDate?: Date`):
  - `todayIST(now?: Date): string` → `"YYYY-MM-DD"` in Asia/Kolkata (use `Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'})`).
  - `isUpcoming(e, now?: Date): boolean` → `(endDate ?? date)` as IST date string `>= todayIST(now)`.
  - `splitEvents<T>(events: T[], now?: Date): { upcoming: T[]; past: T[] }` → upcoming sorted ascending by date, past descending.
  - `semesterOf(date: Date): { key: string; label: string }` → Jan–Jun ⇒ `{key:'2026-even', label:'Even Sem 2026'}`, Jul–Dec ⇒ `{key:'2026-odd', label:'Odd Sem 2026'}` (IST month).
  - `groupBySemester<T>(past: T[]): { key: string; label: string; events: T[] }[]` → newest semester first, preserving input order inside.
  - `formatEventDate(date: Date): string` → `"15 NOV 2026"` (IST).

- [ ] **Step 1: Write failing tests:**
```ts
const ev = (d: string, end?: string) => ({ data: { date: new Date(d), endDate: end ? new Date(end) : undefined } });
const NOW = new Date('2026-11-14T20:00:00Z'); // = 15 Nov 01:30 IST
test('event dated today IST is upcoming even when UTC is still yesterday', () =>
  expect(isUpcoming(ev('2026-11-15'), NOW)).toBe(true));
test('yesterday is past', () => expect(isUpcoming(ev('2026-11-14'), NOW)).toBe(false));
test('multi-day event still running is upcoming', () => expect(isUpcoming(ev('2026-11-13','2026-11-16'), NOW)).toBe(true));
test('split sorts upcoming asc, past desc', ...);   // assert order of dates
test('split with no future events returns empty upcoming', () => expect(splitEvents([ev('2025-01-01')], NOW).upcoming).toEqual([]));
test('semesterOf: Jun → Even, Jul → Odd, Dec 31 23:00 UTC→ next-year Even (IST)', ...);
test('groupBySemester orders newest semester first', ...);
test('formatEventDate', () => expect(formatEventDate(new Date('2026-11-15'))).toBe('15 NOV 2026'));
```
- [ ] **Step 2:** `npm test` → FAIL (module missing).
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npm test` → all PASS. Commit `feat: add IST-aware event date logic`.

### Task 4: Content collections, data files, seed content

**Files:**
- Create: `src/content.config.ts`, `src/data/site.ts`, `src/data/resources.yaml`, `src/data/timeline.yaml`, 7 events in `src/content/events/` (3 upcoming relative to Nov 2026, 4 past across two semesters; one past event with no poster and no photos; one upcoming with title `"Introduction to Containerization & Orchestration Fundamentals"` for overflow testing), 4 team members in `src/content/team/` (one `alumni: true`), placeholder images (generated solid/grid PNGs are fine).

**Interfaces:**
- Produces: collections `events` and `team` with schemas exactly per spec §5 (`photos: z.array(z.object({ src: image(), alt: z.string() })).optional()`, `type: z.enum(['workshop','talk','hacknight','installfest','other'])`, `summary: z.string().max(160)`); `export const SITE = { name, shortName:'GLUG/FET-JU', tagline, stats:{members:120,events:40,years:3}, socials:{linkedin:'https://www.linkedin.com/company/glug-fet-ju/', github, instagram}, joinFormUrl, chatUrl, fsmkUrl:'https://fsmk.org' }`; YAML shapes per spec §5. Every placeholder value has a `# TODO-REAL` comment.

- [ ] **Step 1:** Write a Vitest-free check: add an intentionally invalid event (`summary` 200 chars) and run `npm run check` → expect schema error naming the file. Remove it.
- [ ] **Step 2:** Implement config + seed content.
- [ ] **Step 3:** `npm run check && npm run build` → PASS, 0 errors. Commit `feat: add content collections and seed content`.

### Task 5: Shared components — Nav, Footer, Button, SectionHead, Ticker

**Files:**
- Create: `src/components/{Nav,Footer,Button,SectionHead,Ticker}.astro`; Modify: `Base.astro` to include Nav/Footer; Test: `tests/e2e/nav.spec.ts`

**Interfaces:**
- `Button` props `{ href: string; variant?: 'primary'|'ghost'; external?: boolean }` — primary = orange fill, ink text, 2px border, 5px shadow; on dark bg pass `class="on-dark"` (paper border/shadow). `external` adds `target=_blank rel="noopener"`.
- `SectionHead` props `{ num: string; label: string; title: string; intro?: string }` — renders `h2`. Plain `title` prop by default; an optional named slot `title` overrides it when markup is needed (e.g. an orange `<em>` word).
- `Ticker` props `{ items: string[] }` — duplicated track, CSS `translateX(-50%)` 30s loop, `aria-hidden="true"` (decorative), pauses on reduced motion.
- `Nav` — links: Events, About, Team, Resources, `Join →` (orange). < 760px: button `aria-expanded` + `aria-controls` opens full-screen overlay (paper bg, links at ~48px uppercase), Esc closes, focus trapped, body scroll locked. Current page link gets `aria-current="page"`.
- `Footer` — all nav links repeated (no-JS fallback), licence line `This site is free software (GPL-3.0) · Source on GitHub`, socials from `SITE`.

- [ ] **Step 1: Write failing tests** in `nav.spec.ts`: at 390×844, menu button visible, desktop links hidden; click → overlay visible and `aria-expanded="true"`; Esc → hidden and focus back on button; at 1440, desktop links visible; footer contains links to all 5 pages.
- [ ] **Step 2:** `npm run e2e` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npm run e2e` → PASS. Commit `feat: add nav, footer and shared components`.

### Task 6: Homepage + EventCard + Stats

**Files:**
- Create: `src/components/EventCard.astro`, `src/components/Stats.astro`; Modify: `src/pages/index.astro`; Test: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `splitEvents`, `formatEventDate` (Task 3); `SITE` (Task 4); components (Task 5); `Logo` (Task 2).
- `EventCard` props `{ event: CollectionEntry<'events'>; size?: 'lg'|'sm' }` — top bar (date mono · type tag orange), poster via `<Image>` (4:3, `alt="<title> poster"`) or typographic fallback (title on `.grid-bg`), body (h3 title, mono `venue · Register →` / `venue · Recap →`), whole card links to `/events/<id>/`.
- `Stats` props `{ items: { value: number | string; suffix?: string; label: string }[] }` — renders final values in HTML; inline script counts up from 0 on intersect (skipped under reduced motion).
- Homepage section order and copy exactly as `homepage-v2.html` mockup / spec §4: Hero → Ticker(`LINUX, GIT, OPEN SOURCE, WORKSHOPS, INSTALL FESTS, HACKTOBERFEST, FOSS`) → `01 UPCOMING / Next up` (max 3; empty state `Nothing scheduled right now — follow us on LinkedIn` linking `SITE.socials.linkedin`; mobile = horizontal scroll-snap row) → `02 WHAT WE DO / Not a club. A commit history.` (4 columns, 2×2 < 900px) → Stats (`MEMBERS`, `EVENTS`, `YEARS`, `∞ DISTRO DEBATES`) → `03 ARCHIVE / Been there, shipped that` (latest 4 past, link `All past events →`) → `04 JOIN / Your first commit starts here.` dark CTA with grid.
- Hero: headline lines animate up (staggered 80ms) on load.

- [ ] **Step 1: Write failing tests:** home shows 3 upcoming cards in date order; archive shows 4 cards; the no-poster event card renders fallback (no `img` inside); stats text with JS disabled reads `120+`; empty state: build-time override — `splitEvents` accepts `now`, page reads `import.meta.env.GLUG_NOW` (ISO string, default `new Date()`), test runs a separate preview with `GLUG_NOW=2030-01-01` and asserts empty-state text. (Add `GLUG_NOW` to README as a dev/test-only knob.)
- [ ] **Step 2:** FAIL → **Step 3:** implement → **Step 4:** `npm run e2e` PASS.
- [ ] **Step 5:** Compare against mockup at 1440 and 390 by screenshot; spacing must match v2 (not the cramped v1). Commit `feat: build homepage`.

### Task 7: Events index and event detail

**Files:**
- Create: `src/pages/events/index.astro`, `src/pages/events/[slug].astro`; Test: `tests/e2e/events.spec.ts`

**Interfaces:**
- Consumes: `splitEvents`, `groupBySemester`, `isUpcoming`, `formatEventDate`, `EventCard`, `SectionHead`, `Button`.
- Index: upcoming grid (or empty state), then past grouped by semester (`h3` = label). Filter chips `All · Workshop · Talk · Hack Night · Install Fest · Other` as buttons with `aria-pressed`; script hides non-matching cards and empty semester groups; without JS chips are hidden (`[hidden]` until script runs) and everything shows.
- Detail (`getStaticPaths` over all events, slug = entry id): big uppercase title, mono meta row (date, venue, type), poster (or fallback), Markdown body (max-width 68ch, 18px), if upcoming & `registerUrl` → primary `Register →` button (external); if past → `IT HAPPENED` badge (ink bg, paper text) and photo grid (only if `photos`), `← All events` link.

- [ ] **Step 1: Write failing tests:** index lists all 7 events; clicking "Talk" leaves only talk cards visible; detail of an upcoming event has Register link with the seed URL; detail of the no-photo past event has the badge, no Register, no gallery; unknown slug returns 404 page.
- [ ] **Step 2:** FAIL → **Step 3:** implement → **Step 4:** PASS. Commit `feat: add events pages`.

### Task 8: About, Team, Resources, Join, 404

**Files:**
- Create: `src/pages/{about,team,resources,join,404}.astro`, `src/components/TeamCard.astro`; Test: `tests/e2e/pages.spec.ts`

**Interfaces:**
- `TeamCard` props `{ member: CollectionEntry<'team'> }` — square photo (`alt` = name) with 2px border + shadow, name (700, 22px), role mono muted, GitHub/LinkedIn icon links with `aria-label`.
- About: SectionHead `Software freedom, in practice`, manifesto (3 short paragraphs — placeholder `TODO-REAL`), timeline from `timeline.yaml` (year in big orange mono, text), FSMK block linking `SITE.fsmkUrl`.
- Team: current members grouped by `year` desc, sorted by `order` then name; `Alumni` section last.
- Resources: per topic `h2` + list; level tag mono uppercase pill (beginner/intermediate/advanced).
- Join: `Why join` (3 points), `What you get`, two Buttons → `SITE.joinFormUrl`, `SITE.chatUrl` (external).
- 404: mono `bash: page: command not found` large, `cd ~` link to `/`.

- [ ] **Step 1: Write failing tests:** each route 200 with one `h1`; team page has 3 current + 1 alumni card; resources shows each topic from YAML; join buttons point at `SITE` URLs; `/nope` shows `command not found`.
- [ ] **Step 2:** FAIL → **Step 3:** implement → **Step 4:** PASS. Commit `feat: add about, team, resources, join and 404 pages`.

### Task 9: SEO, overflow, no-JS and Lighthouse verification

**Files:**
- Modify: `astro.config.mjs` (`site: 'https://glug-fet-ju.pages.dev'` TODO-REAL, `@astrojs/sitemap`), `Base.astro` (canonical, OG/Twitter tags; event pages pass poster URL, else `/og-default.png`)
- Create: `public/robots.txt`, `public/og-default.png` (1200×630: paper bg, `FREE AS IN FREEDOM.` + logo), `tests/e2e/layout.spec.ts`, `lighthouserc.json`

- [ ] **Step 1: Write failing tests** in `layout.spec.ts`: for every route × widths [320, 390, 768, 1440], `document.documentElement.scrollWidth <= innerWidth`; with `javaScriptEnabled:false`: home stats show `120+`, `/events` shows all 7 cards, footer links present; every page has `meta[property="og:image"]` and `link[rel=canonical]`.
- [ ] **Step 2:** Run → fix any failures (expect the long-title event at 320px to need `overflow-wrap:anywhere`/`hyphens:auto` + smaller clamp minimum).
- [ ] **Step 3:** `npx lhci autorun` with mobile preset on `/` and the long-title event page; assert ≥ 0.9 all four categories. Fix regressions (likely: image sizes, font preload of Inter Tight 900 only).
- [ ] **Step 4:** Screenshots at 390 and 1440 for all routes saved to `.superpowers/screens/` for human review. Commit `feat: SEO metadata and layout verification`.

### Task 10: CI, daily rebuild, docs, deploy

**Files:**
- Create: `.github/workflows/ci.yml` (on PR/push: `npm ci`, `check`, `test`, `build`, `e2e`), `.github/workflows/daily-rebuild.yml` (cron `0 19 * * *` = 00:30 IST; `curl -X POST "$CF_DEPLOY_HOOK"` from secret `CF_DEPLOY_HOOK`), `README.md`

- [ ] **Step 1:** README sections: What this is · Run locally · **Add an event** (copy-paste front matter template + where images go) · Add a team member · Edit resources/stats/links · How deploy works · Licence.
- [ ] **Step 2:** Push to GitHub (ask user for repo URL / permission first), confirm CI green.
- [ ] **Step 3:** Hand user the Cloudflare Pages setup steps (connect repo, build `npm run build`, output `dist`, Node 24; create deploy hook → add as `CF_DEPLOY_HOOK` secret). These require the user's accounts — do not attempt them without them.
- [ ] **Step 4:** Commit `chore: add CI, daily rebuild and README`.
