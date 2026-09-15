import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  webServer: {
    command: "RAZORPAY_MOCK=true SMTP_HOST=json OPS_JOB_SECRET=playwright-operations-secret-123456789 npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } }
  ]
});
