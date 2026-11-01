import { defineConfig, devices } from '@playwright/test';

// Two builds: the main one pinned to 2026-11-01 so seed events split deterministically,
// and a "future" one where every event is in the past (empty-state tests).
const server = (now: string, outDir: string, port: number) => ({
  command: `GLUG_NOW=${now} GLUG_OUT=${outDir} npm run build && GLUG_OUT=${outDir} npx astro preview --port ${port} --ignore-lock`,
  url: `http://localhost:${port}`,
  reuseExistingServer: false,
  timeout: 180_000,
});

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'line',
  use: { baseURL: 'http://localhost:4521' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [server('2026-11-01T06:00:00Z', './dist', 4521), server('2030-01-01T06:00:00Z', './.dist-future', 4522)],
});
