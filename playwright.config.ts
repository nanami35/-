import { defineConfig, devices } from "@playwright/test";

// E2E設定(要件20 Step6)。既存の起動済みサーバ or 自動起動を利用。
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // 環境にプリインストールされたChromiumを利用(playwright install不要)。
        launchOptions: process.env.PW_CHROME
          ? { executablePath: process.env.PW_CHROME }
          : {},
      },
    },
  ],
});
