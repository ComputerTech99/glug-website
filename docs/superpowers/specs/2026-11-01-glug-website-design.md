# GLUG FET-JU Website — Design Spec

**Date:** 2026-11-01
**Status:** Approved in brainstorming, pending written-spec review

## 1. Goal

A public website for GLUG FET-JU (GNU/Linux Users Group, Faculty of Engineering & Technology, Jain University). It must:

- **A. Recruit** — make students want to join (homepage priority).
- **B. Showcase events** — upcoming events + archive (homepage priority).
- **C. Build credibility** — about, history, team, FSMK connection.
- **D. Be a member hub** — curated learning resources.

It must not look templated/"AI-generated". It must work equally well on mobile and desktop.

**Success criteria**
- A maintainer adds an event by committing one Markdown file; the site redeploys on push with no layout code touched.
- Lighthouse mobile ≥ 90 for Performance, Accessibility, Best Practices, SEO on Home and an event page.
- No horizontal scroll from 320px to 1920px wide.

## 2. Constraints & decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | **Astro** (static output) + content collections | Content-driven, near-zero JS, typed content |
| Data storage | **Markdown/YAML files in the repo** — no database | Maintainer updates via code; visitors submit nothing |
| Visitor input | None on-site; links out to Google Form / WhatsApp / Discord | Keeps site static |
| Hosting | **Cloudflare Pages**, auto-deploy on push to `main` | Free, fast in India, preview deploys |
| Styling | Plain CSS with custom properties (no Tailwind/UI kit) | Full control of the bespoke look; small footprint |
| JS | Only for small progressive enhancements (count-up stats, events filter) | Site fully usable with JS off |
| Licence | Site code GPL-3.0 | FOSS club |
| Out of scope (v1) | Blog, search, dark mode, logins, on-site registration | YAGNI; easy to add later |

## 3. Visual design

Direction chosen: **"C's poster energy, A's colours, ink-led"** with generous whitespace (reference mockup: `.superpowers/brainstorm/*/content/homepage-v2.html`).

**Tokens**
```
--paper: #F4F1EA   page background (warm off-white)
--ink:   #141414   text, borders, shadows
--muted: #141414 @ 60%   secondary text
--line:  #141414 @ 12%   hairline dividers
--sig:   #FF5A1F   the single accent ("signal orange")
--white: #FFFFFF   card surfaces
```
Orange is a spark, never a fill for large areas: key headline word, primary button, section numbers, ✦ markers, tags. Large dark block allowed only for the Join CTA section.

Note on contrast: `--sig` on `--paper` is used for large/bold text and decoration only; small body text is always `--ink`/`--muted`. Primary button = ink text on orange (passes AA).

**Type**
- Display/body: **Inter Tight** (400/500/700/900). Headlines: weight 900, UPPERCASE, letter-spacing ≈ −0.06em, line-height ≈ 0.86, fluid `clamp()` sizes (hero up to ~220px, section titles up to ~112px).
- Labels/meta/nav/buttons: **JetBrains Mono** (400/600), small caps-like uppercase with +0.08em tracking.
- Fonts self-hosted via `@fontsource` (no Google Fonts request at runtime).

**Signature elements**
- Faint 48px grid background on hero and CTA.
- Cards & buttons: 2px ink border + hard offset shadow (5–8px, no blur). Hover: translate −3px and shadow grows.
- Section header pattern: mono label (`01 UPCOMING`, orange number) + huge uppercase title on the left, short muted intro paragraph right-aligned (stacks on mobile).
- Infinite ticker strip (LINUX ✦ GIT ✦ OPEN SOURCE …) between hairlines.
- Spacing: section vertical padding `clamp(96px, 16vh, 180px)`; page gutter `clamp(20px, 6vw, 96px)`; max content width 1360px. Sections separated by space/hairlines, not heavy borders.

**Logo**
- Source: club's black-and-white Tux PNG with monospace "Linux Users Group" text.
- Deliverable: hand-traced clean **SVG** (`src/assets/logo.svg`), transparent background, `currentColor` fills so it inherits ink. Also a small nav mark and favicon set derived from it.

**Motion** (all disabled under `prefers-reduced-motion: reduce`)
- Hero headline lines slide/fade up in sequence on load (CSS).
- Tux SVG stroke draw-in on load.
- Ticker: CSS translate loop.
- Stats: count up when scrolled into view (IntersectionObserver; static numbers without JS).
- Card hover lift.

## 4. Information architecture

| Route | Purpose | Content |
|---|---|---|
| `/` | A B C D | Hero → ticker → 01 Upcoming (next 3) → 02 What we do (4 cols) → stats → 03 Archive teaser (4 latest past) → 04 Join CTA → footer |
| `/events` | B | Upcoming cards; past events grouped by semester; client-side type filter (all shown without JS) |
| `/events/[slug]` | B | Poster, date, venue, type, description (Markdown body), Register button if upcoming & `registerUrl`; if past: "It happened" badge + photo gallery |
| `/about` | C | Manifesto, history timeline (from `src/data/timeline.yaml`), FSMK section |
| `/team` | C | Current team grouped by year; alumni section |
| `/resources` | D | Topics → links with level tag (beginner/intermediate/advanced) |
| `/join` | A | Why join, what you get, buttons to join form + chat |
| `/404` | — | `bash: page: command not found` + link home |

**Global layout:** nav (logo mark + Events/About/Team/Resources + orange "Join →"); on < 760px collapses to a menu button opening a full-screen overlay. Footer: licence line, source link, socials.

**Empty states:** no upcoming events → "Nothing scheduled right now — follow us on LinkedIn" with link. No photos on past event → gallery hidden.

## 5. Content model

Astro content collections with Zod schemas (build fails on invalid content).

**`src/content/events/*.md`**
```yaml
title: string
date: date            # start; upcoming = date >= build day
endDate?: date
venue: string
type: workshop | talk | hacknight | installfest | other
poster?: image         # relative path, optimised by astro:assets; if absent, card shows a typographic fallback (title on grid)
summary: string        # ≤ 160 chars, used on cards + meta description
registerUrl?: url
photos?: { src: image, alt: string }[]
```
Body = event description (Markdown).

**`src/content/team/*.md`**
```yaml
name: string
role: string
year: number           # tenure year, e.g. 2026
photo: image
github?: url
linkedin?: url
alumni?: boolean (default false)
order?: number         # sort within year
```

**`src/data/`**
- `site.ts` — club name, tagline, stats `{members, events, years}`, socials, `joinFormUrl`, `chatUrl`.
- `resources.yaml` — `[{ topic, links: [{ title, url, level, note? }] }]`.
- `timeline.yaml` — `[{ year, text }]`.

**Upcoming vs past** is computed at build time. Because the site is static, a scheduled rebuild keeps this accurate: a Cloudflare Pages deploy hook triggered daily (GitHub Actions cron, ~00:30 IST).

## 6. Project structure

```
src/
  assets/            logo.svg, fonts handled by @fontsource
  components/        Nav, Footer, SectionHead, EventCard, TeamCard, Ticker, Stats, Button
  content/           events/, team/  (+ content.config.ts schemas)
  data/              site.ts, resources.yaml, timeline.yaml
  layouts/           Base.astro (head/meta/OG, nav, footer)
  pages/             index, events/index, events/[slug], about, team, resources, join, 404
  styles/            tokens.css, base.css, utilities.css
  lib/               events.ts (sort, upcoming/past split, semester grouping)
public/              favicon, robots.txt
.github/workflows/   daily-rebuild.yml
README.md            "How to add an event / member / resource"
```
Each component owns its own scoped `<style>`; shared tokens live in `tokens.css`.

## 7. SEO & sharing

- Per-page `<title>`/description; event pages use `summary`.
- Open Graph + Twitter card images: event poster for event pages, a static branded OG image for others.
- `@astrojs/sitemap`, `robots.txt`, canonical URLs.

## 8. Accessibility

- Semantic landmarks, one `h1` per page, visible focus styles (orange 2px outline offset).
- Colour contrast AA for all text (see §3 note).
- Mobile menu: focus trap, Esc to close, `aria-expanded`.
- Alt text: poster alt = "<title> poster"; gallery photos require `alt` in the schema; team photos use the member's name.
- Reduced-motion respected globally.

## 9. Testing & verification

- `astro check` (types + content schemas) and `astro build` pass with zero errors.
- Unit tests (Vitest) for `src/lib/events.ts`: upcoming/past split around today, sorting, semester grouping (Jan–Jun = Even, Jul–Dec = Odd).
- Playwright smoke: every route returns 200 and renders its `h1`; nav menu opens/closes on mobile viewport; no horizontal overflow at 320 / 390 / 768 / 1440px.
- Lighthouse CI on `/` and one event page, mobile preset, thresholds ≥ 90.
- Screenshots at 390px and 1440px reviewed before calling v1 done.

## 10. Seed content

Ship v1 with: 3 example upcoming events, 4 example past events, 4 team members, ~3 resource topics — all clearly placeholder (marked `TODO-REAL` in front matter comments) so the maintainer can replace them. Stats/socials/join URLs in `site.ts` likewise.
