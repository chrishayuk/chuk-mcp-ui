import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  fullyParallel: true,
  retries: 1,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ["list"],
    ["json", { outputFile: "../../../docs/compat-matrix.json" }],
  ],
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5199",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec vite --port 5199",
    port: 5199,
    cwd: "..",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
