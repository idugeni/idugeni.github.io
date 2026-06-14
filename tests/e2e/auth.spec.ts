import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveTitle(/Login/);
    await expect(page.locator("form")).toBeVisible();
  });

  test("login form has required fields", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("invalid credentials show error", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"], input[type="email"]', "nonexistent@test.com");
    await page.fill('input[name="password"], input[type="password"]', "wrong-password-123");
    await page.locator('button[type="submit"]').click();

    // Should show error message
    await expect(
      page.locator('[role="alert"], [role="status"], .text-red-500, .text-destructive').first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("protected admin route redirects to login", async ({ page }) => {
    await page.goto("/admin");

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
  });

  test("login with empty fields shows validation", async ({ page }) => {
    await page.goto("/login");

    await page.locator('button[type="submit"]').click();

    // Should show validation errors
    await expect(
      page.locator('[role="alert"], .text-red-500, .text-destructive').first()
    ).toBeVisible();
  });

  test("email validation rejects invalid format", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"], input[type="email"]', "not-an-email");
    await page.locator('button[type="submit"]').click();

    await expect(
      page.locator('[role="alert"], .text-red-500, .text-destructive').first()
    ).toBeVisible();
  });
});
