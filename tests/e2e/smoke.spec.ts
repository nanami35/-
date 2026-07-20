import { test, expect } from "@playwright/test";

// 主要フローのE2Eスモークテスト(要件22 完成条件)。
// seed のデモパスワードは SEED_DEMO_PASSWORD(未設定時は "password")。
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "password";

async function login(page: import("@playwright/test").Page, email = "admin@abengers.jp") {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', DEMO_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard");
}

test("未ログイン時はログインへリダイレクトされる", async ({ page }) => {
  await page.goto("/dashboard");
  await page.waitForURL("**/login");
  await expect(page.locator("h2")).toContainText("ログイン");
});

test("ログインしてダッシュボードが表示される", async ({ page }) => {
  await login(page);
  await expect(page.locator("h1")).toContainText("おかえりなさい");
});

test("企業図鑑→企業詳細を閲覧できる", async ({ page }) => {
  await login(page);
  await page.goto("/companies");
  await expect(page.getByText("ベンチャー・リンク").first()).toBeVisible();
  await page.getByText("ベンチャー・リンク").first().click();
  await page.waitForURL("**/companies/**");
  await expect(page.locator("h1")).toContainText("ベンチャー・リンク");
  // タブ切替
  await page.getByRole("button", { name: "自社への応用" }).click();
  await expect(page.getByText("ABENGERSが学ぶべき点")).toBeVisible();
});

test("比較マトリクスが表示される", async ({ page }) => {
  await login(page);
  await page.goto("/compare");
  await expect(page.getByRole("cell", { name: "経営戦略策定" })).toBeVisible();
});

test("全体検索が機能する", async ({ page }) => {
  await login(page);
  await page.goto("/search?q=FC");
  await expect(page.getByText("該当する情報が見つかりません")).toHaveCount(0);
});

test("AIチャットが出典付きで回答する", async ({ page }) => {
  await login(page);
  await page.goto("/chat");
  await page.getByText("ABENGERSとハンズオンVCの違いは？").click();
  await expect(page.getByText("参照した情報").first()).toBeVisible({ timeout: 15000 });
});

test("権限による可視性: 閲覧専用ユーザーはプロジェクト限定情報を見られない", async ({ page }) => {
  await login(page, "viewer@abengers.jp");
  await page.goto("/projects");
  // viewerロールはproject_members限定を閲覧不可 → 空状態
  await expect(page.getByText("閲覧可能なプロジェクトがありません")).toBeVisible();
});
