# GLUG FET-JU website

The website of **GLUG FET-JU** — the GNU/Linux Users Group at the Faculty of Engineering & Technology, Jain University.

Built with [Astro](https://astro.build). Static, fast, no database: every event, team member and resource is a plain text file in this repo. Licensed under the **GPL-3.0**.

---

## Run it locally

Requires Node.js 22.23+ (24 recommended).

```sh
npm install
npm run dev          # http://localhost:4321
```

| Command          | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `npm run dev`    | Dev server with hot reload                               |
| `npm run build`  | Build the static site into `dist/`                       |
| `npm run check`  | Type-check and validate all content files                |
| `npm test`       | Unit tests (event date logic)                            |
| `npm run e2e`    | Browser tests (first time: `npx playwright install chromium`) |

---

## Add an event

1. Create a file in `src/content/events/` named `YYYY-MM-DD-short-name.md`. The file name becomes the URL: `/events/YYYY-MM-DD-short-name/`.
2. Put the poster image in `src/content/events/images/`.
3. Paste and fill in:

```md
---
title: Linux Install Fest
date: 2026-11-15                 # YYYY-MM-DD
# endDate: 2026-11-16            # optional, for multi-day events
venue: FET Seminar Hall
type: installfest                # workshop | talk | hacknight | installfest | other
poster: ./images/install-fest.png  # optional — without it the card shows the title instead
summary: One or two sentences, max 160 characters. Shown on cards and in link previews.
registerUrl: https://forms.gle/... # optional — shows a Register button while the event is upcoming
---
The full description, in Markdown. **Bold**, lists, links — all fine.
```

4. Commit and push. The site rebuilds itself in about a minute.

**After the event**, add photos so the event page shows a gallery:

```yaml
photos:
  - src: ./images/install-fest-1.jpg
    alt: Students dual-booting laptops in the seminar hall   # describe the photo — required
```

Events move from "Upcoming" to "Past" automatically (the site rebuilds every night at 00:30 IST). Dates are in India time.

If you make a mistake (missing date, summary too long, unknown type), `npm run check` and the build will fail with a message naming the file and field — nothing broken gets published.

## Add a team member

Create `src/content/team/their-name.md` and put a square photo in `src/content/team/images/`:

```md
---
name: Full Name
role: Tech Lead
year: 2026          # the year they're on the core team
photo: ./images/their-name.jpg
github: https://github.com/username      # optional
linkedin: https://www.linkedin.com/in/username  # optional
order: 2            # optional — lower shows first
alumni: false       # set to true when they graduate
---
```

## Edit resources, history, stats and links

| What                                   | File                     |
| -------------------------------------- | ------------------------ |
| Learning resources (`/resources`)      | `src/data/resources.yaml`|
| History timeline (`/about`)            | `src/data/timeline.yaml` |
| Stats, social links, join form, chat   | `src/data/site.ts`       |
| Page copy (headlines, about text)      | `src/pages/*.astro`      |

Anything marked `TODO-REAL` is placeholder content to replace.

---

## How deployment works

- Hosted on **Cloudflare Pages** (free). Every push to `main` builds and deploys the site.
- **CI** (`.github/workflows/ci.yml`) runs the content check, unit tests, browser tests and Lighthouse on every push and pull request.
- **Daily rebuild** (`.github/workflows/daily-rebuild.yml`) hits a Cloudflare deploy hook every night so past events move to the archive.

### One-time setup

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick this repo.
2. Build command `npm run build`, output directory `dist`, environment variable `NODE_VERSION=24`.
3. In the Pages project: **Settings → Builds → Deploy hooks → Add** (branch `main`). Copy the URL.
4. GitHub repo → **Settings → Secrets and variables → Actions → New secret** named `CF_DEPLOY_HOOK` with that URL.
5. If you use a custom domain, update `site` in `astro.config.mjs` and the `Sitemap:` line in `public/robots.txt`.

### Testing knob

`GLUG_NOW=2026-11-01T06:00:00Z npm run build` builds the site as if it were that date. The browser tests use this so they don't depend on today's date.

---

## Design

Warm paper background, ink-black type, one signal orange. Huge uppercase headlines (Inter Tight 900), monospace labels (JetBrains Mono), hard offset shadows on cards and buttons. Tokens live in `src/styles/tokens.css`. The design spec is in `docs/superpowers/specs/`.

## License

[GPL-3.0-or-later](LICENSE). Free as in freedom.
