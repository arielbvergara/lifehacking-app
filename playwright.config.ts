import { defineConfig, devices } from '@playwright/test';

/**
 * E2E Test Configuration
 * 
 * Local Development (default):
 * - Frontend: http://localhost:3000 (tests your changes before deployment)
 * - Backend: http://localhost:5055
 * - Starts local dev server automatically
 * 
 * CI/CD (deployed environment):
 * - Set E2E_BASE_URL=https://lifehacking.vercel.app in CI
 * - Tests against deployed test environment after code is deployed
 * - No local server needed
 * 
 * See https://playwright.dev/docs/test-configuration.
 */

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
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
