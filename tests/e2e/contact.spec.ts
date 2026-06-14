import { test, expect } from "@playwright/test";

test.describe("Contact Form", () => {
  test("contact page loads with form", async ({ page }) => {
    await page.goto("/contact");
    
    await expect(page).toHaveTitle(/Contact/);
    await expect(page.locator("form")).toBeVisible();
  });

  test("empty form shows validation errors", async ({ page }) => {
    await page.goto("/contact");
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Check for validation messages
    await expect(page.locator('[role="alert"], .text-red-500, .text-destructive').first()).toBeVisible();
  });

  test("form fields are present", async ({ page }) => {
    await page.goto("/contact");
    
    // Check for required fields
    await expect(page.locator('input[name="nama"], input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="pesan"], textarea[name="message"]')).toBeVisible();
  });

  test("form submission with valid data", async ({ page }) => {
    await page.goto("/contact");
    
    // Fill form
    await page.fill('input[name="nama"], input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('textarea[name="pesan"], textarea[name="message"]', "This is a test message for E2E testing.");
    
    // Submit
    await page.locator('button[type="submit"]').click();
    
    // Wait for success message or toast
    await expect(page.locator('[role="status"], .toast, [data-sonner-toast]').first()).toBeVisible({ timeout: 10000 });
  });

  test("email validation rejects invalid format", async ({ page }) => {
    await page.goto("/contact");
    
    await page.fill('input[name="email"]', "invalid-email");
    await page.locator('button[type="submit"]').click();
    
    // Should show email validation error
    await expect(page.locator('[role="alert"], .text-red-500, .text-destructive').first()).toBeVisible();
  });

  test("file attachment field is present", async ({ page }) => {
    await page.goto("/contact");
    
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeVisible();
  });
});
