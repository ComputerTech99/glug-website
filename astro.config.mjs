// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://glug-fet-ju.pages.dev', // TODO-REAL: change when a custom domain is set up
  outDir: process.env.GLUG_OUT ?? './dist',
  integrations: [sitemap()],
});
