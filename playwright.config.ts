import { defineConfig, devices } from "@playwright/test";
import "./scripts/env";

/**
 * E2E tests run against a production build on port 3100 using TEST_DATABASE_URL
 * (rebuilt from migrations + seed by tests/e2e/global-setup.ts).
 */
const PORT = 3100;
const DB = process.env.TEST_DATABASE_URL ?? "postgres://atlas:atlas@localhost:5432/atlas_test";

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : undefined,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, testIgnore: /mobile\.spec\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/hr`,
    timeout: 300_000,
    reuseExistingServer: !process.env.CI,
    env: { DATABASE_URL: DB, NEXT_PUBLIC_E2E: "1", NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`, APP_SECRET: process.env.APP_SECRET ?? "e2e-secret-e2e-secret-e2e-secret", RESEND_API_KEY: "" },
  },
});
