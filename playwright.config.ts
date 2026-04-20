import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright config for the golden-path e2e suite.
 *
 * Runs with dev bypass auth so we don't need Firebase creds in CI.
 * Spawns `next dev` automatically on port 3000 unless the user
 * already has one running (webServer.reuseExistingServer).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : [["list"]],
  // Dev-mode on-demand compilation is slow the first time a route is
  // hit. CI should run against the production build (npm start) for
  // faster and deterministic navigation — see README deploy notes.
  timeout: 120_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "NEXT_PUBLIC_DEV_BYPASS_AUTH=true ALLOW_DEV_AUTH_BYPASS=true npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
})
