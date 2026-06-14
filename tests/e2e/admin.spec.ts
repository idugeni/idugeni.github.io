import { test, expect } from "@playwright/test";

test.describe("Admin Panel", () => {
  test("admin page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test("admin sub-routes redirect unauthenticated users", async ({ page }) => {
    await page.goto("/admin/messages");
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test("admin monitoring page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin/monitoring");
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test("admin blog page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin/blog");
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test("admin analytics page redirects unauthenticated users", async ({ page }) => {
    await page.goto("/admin/analytics");
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });
});
