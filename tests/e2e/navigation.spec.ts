import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    
    await expect(page).toHaveTitle(/IRNK Codes/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("navbar links navigate correctly", async ({ page }) => {
    await page.goto("/");
    
    // Test About link
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL(/\/about/);
    
    // Test Blog link
    await page.click('a[href="/blog"]');
    await expect(page).toHaveURL(/\/blog/);
    
    // Test Projects link
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL(/\/projects/);
    
    // Test Contact link
    await page.click('a[href="/contact"]');
    await expect(page).toHaveURL(/\/contact/);
  });

  test("mobile hamburger menu toggles", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i]');
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator("nav")).toBeVisible();
    }
  });

  test("footer links work", async ({ page }) => {
    await page.goto("/");
    
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    
    // Check for at least one link in footer
    const footerLinks = footer.locator("a");
    expect(await footerLinks.count()).toBeGreaterThan(0);
  });

  test("404 page renders for invalid routes", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-12345");
    
    await expect(page.locator("body")).toContainText(/404|not found/i);
  });
});
