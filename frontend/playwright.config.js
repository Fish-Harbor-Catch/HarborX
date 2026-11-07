import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 45000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    serviceWorkers: "allow",
    trace: "off",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node tests/serve-pwa.mjs",
    url: "http://127.0.0.1:4173/api/health",
    reuseExistingServer: false,
  },
  projects: [
    {
      name: "android-chromium",
      use: { ...devices["Pixel 7"], browserName: "chromium" },
    },
    {
      name: "iphone-webkit",
      use: { ...devices["iPhone 13"], browserName: "webkit" },
    },
    {
      name: "desktop-chromium",
      use: { viewport: { width: 1440, height: 900 }, browserName: "chromium" },
    },
  ],
});
