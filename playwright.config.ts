import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4321',
  },
  // Serves dist/ (run `npm run build` first). Reuses a preview you already
  // have running; otherwise starts one for the run.
  webServer: {
    command: 'node scripts/preview.mjs',
    url: 'http://localhost:4321/',
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'iphone-12',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'iphone-se',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'iphone-pro-max',
      use: { ...devices['iPhone 14 Pro Max'] },
    },
  ],
});
