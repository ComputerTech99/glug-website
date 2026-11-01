// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages serves this repo at https://computertech99.github.io/glug-website/.
// The deploy workflow sets GLUG_SITE + GLUG_BASE; locally (and with a custom domain) the base is '/'.
export default defineConfig({
  site: process.env.GLUG_SITE ?? 'https://computertech99.github.io',
  base: process.env.GLUG_BASE ?? '/',
  trailingSlash: 'always',
  outDir: process.env.GLUG_OUT ?? './dist',
  integrations: [sitemap()],
});
