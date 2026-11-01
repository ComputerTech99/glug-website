// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  outDir: process.env.GLUG_OUT ?? './dist',
});
