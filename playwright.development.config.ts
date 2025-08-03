import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for DEVELOPMENT environment
 *
 * Use this config when:
 * - Running tests against a live development server (pnpm dev)
 * - The dev server is already running on port 3002
 * - You want to test against real-time code changes
 *
 * Usage: playwright test --config=playwright.development.config.ts
 */
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3002'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // No webServer - assumes development server is already running
  // Start your dev server first: pnpm dev --port 3002
})
