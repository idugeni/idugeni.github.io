import { test, expect } from "@playwright/test";

test.describe("Blog", () => {
  test("blog list page loads with articles", async ({ page }) => {
    await page.goto("/blog");
    
    await expect(page).toHaveTitle(/Blog/);
    
    // Check for article cards or list items
    const articles = page.locator("article, [data-blog-card]");
    await expect(articles.first()).toBeVisible({ timeout: 10000 });
  });

  test("blog pagination works", async ({ page }) => {
    await page.goto("/blog");
    
    // Look for pagination controls
    const pagination = page.locator('button:has-text("Next"), a:has-text("Next"), [aria-label*="next" i]');
    
    if (await pagination.first().isVisible()) {
      await pagination.first().click();
      await expect(page).toHaveURL(/page=2|\/2/);
    }
  });

  test("clicking article navigates to detail page", async ({ page }) => {
    await page.goto("/blog");
    
    const firstArticle = page.locator("article a, [data-blog-card] a").first();
    
    if (await firstArticle.isVisible()) {
      await firstArticle.click();
      await expect(page).toHaveURL(/\/blog\/[^/]+$/);
      
      // Check for article content
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("table of contents navigation works", async ({ page }) => {
    await page.goto("/blog");
    
    const firstArticle = page.locator("article a, [data-blog-card] a").first();
    
    if (await firstArticle.isVisible()) {
      await firstArticle.click();
      
      // Look for ToC
      const toc = page.locator('[data-toc], nav[aria-label*="table of contents" i]');
      
      if (await toc.isVisible()) {
        const tocLink = toc.locator("a").first();
        if (await tocLink.isVisible()) {
          await tocLink.click();
          // URL should update with hash
          await expect(page).toHaveURL(/#/);
        }
      }
    }
  });

  test("like button is visible", async ({ page }) => {
    await page.goto("/blog");
    
    const firstArticle = page.locator("article a, [data-blog-card] a").first();
    
    if (await firstArticle.isVisible()) {
      await firstArticle.click();
      
      // Look for like button
      const likeButton = page.locator('button[aria-label*="like" i], [data-like-button]');
      await expect(likeButton.first()).toBeVisible();
    }
  });

  test("comment form is present", async ({ page }) => {
    await page.goto("/blog");
    
    const firstArticle = page.locator("article a, [data-blog-card] a").first();
    
    if (await firstArticle.isVisible()) {
      await firstArticle.click();
      
      // Look for comment section
      const commentSection = page.locator('[data-comments], section:has-text("Comment")');
      await expect(commentSection.first()).toBeVisible();
    }
  });
});
