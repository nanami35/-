import { test } from "@playwright/test";

const SHOT = "/tmp/claude-0/-home-user--/3be65a59-c915-5624-9e69-3899215890c1/scratchpad";

test("screenshots", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto("/login");
  await page.screenshot({ path: `${SHOT}/01-login.png` });
  await page.fill('input[name="email"]', "admin@abengers.jp");
  await page.fill('input[name="password"]', "password");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
  await page.screenshot({ path: `${SHOT}/02-dashboard.png`, fullPage: true });
  await page.goto("/companies/co-venturelink");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${SHOT}/03-company.png`, fullPage: true });
  await page.goto("/compare");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `${SHOT}/04-compare.png` });
  await page.goto("/chat");
  await page.getByText("ABENGERSとハンズオンVCの違いは？").click();
  await page.getByText("参照した情報").first().waitFor({ timeout: 15000 });
  await page.screenshot({ path: `${SHOT}/05-chat.png`, fullPage: true });
});
