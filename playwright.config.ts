import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:3000';
const isLocalEnvironment = baseURL.includes('localhost');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 5, // Enable retries for flaky tests (rate limiting, timing issues)
  workers: process.env.CI ? 1 : 5, // Limit workers to reduce backend load and rate limiting
  reporter: 'html',
  
  // Global setup and teardown (commented out to use real backend)
  // globalSetup: require.resolve('./e2e/global-setup.ts'),
  // globalTeardown: require.resolve('./e2e/global-teardown.ts'),
  
  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only start local dev server when testing against localhost
  ...(isLocalEnvironment && {
    webServer: {
      command: 'pnpm run dev',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  }),
});
