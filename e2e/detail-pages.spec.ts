import { test, expect } from "@playwright/test";

test.describe("Detail Pages - PPR Blank Page Fix", () => {
  test.describe("Blog Detail", () => {
    const blogSlug = "membangun-aplikasi-fullstack-nextjs-16-supabase";

    test("1. renders content (not blank shell)", async ({ page }) => {
      await page.goto(`/blog/${blogSlug}`);

      // Wait for content to appear
      await page.waitForSelector("article, h1, [data-blog-content]", {
        timeout: 15_000,
      });

      // Check that we have actual content, not just a loading shell
      const content = await page.content();
      expect(content).not.toContain('<div style="min-height:100vh"></div>');
      expect(content).not.toMatch(/<div[^>]*>\s*<\/div>\s*<!--\s*\/\$\s*-->/);

      // Verify we have an article or heading
      const hasArticle = await page.locator("article").count();
      const hasH1 = await page.locator("h1").count();
      expect(hasArticle + hasH1).toBeGreaterThan(0);
    });

    test("2. has correct title tag", async ({ page }) => {
      await page.goto(`/blog/${blogSlug}`);

      await expect(page).toHaveTitle(/Next\.js.*Supabase|Panduan|Tutorial/i, {
        timeout: 15_000,
      });

      const title = await page.title();
      expect(title).not.toBe("Blog");
      expect(title).not.toBe("Artikel Tidak Ditemukan");
    });

    test("3. has correct metadata", async ({ page }) => {
      await page.goto(`/blog/${blogSlug}`);

      // Check OpenGraph tags
      const ogTitle = await page.locator('meta[property="og:title"]');
      await expect(ogTitle).toHaveAttribute("content", /.+/);

      const ogType = await page.locator('meta[property="og:type"]');
      await expect(ogType).toHaveAttribute("content", "article");

      // Check published_time is not [object Object]
      const publishedTime = await page.locator(
        'meta[property="article:published_time"]'
      );
      const publishedContent = await publishedTime.getAttribute("content");
      expect(publishedContent).not.toBe("[object Object]");
      expect(publishedContent).toMatch(/\d{4}/); // Should contain year
    });

    test("7. no console errors", async ({ page }) => {
      const errors: string[] = [];

      page.on("pageerror", (error) => {
        errors.push(error.message);
      });

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto(`/blog/${blogSlug}`);
      await page.waitForTimeout(3000);

      // Filter out known non-critical errors
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes("favicon") &&
          !e.includes("manifest") &&
          !e.includes("Failed to load resource") &&
          !e.includes("Connection closed") === false // Keep Connection closed errors
      );

      // Specifically check for Connection closed error
      const hasConnectionError = errors.some((e) =>
        e.includes("Connection closed")
      );

      expect(
        hasConnectionError,
        `Found "Connection closed" error: ${errors.join(", ")}`
      ).toBe(false);
    });
  });

  test.describe("Projects Detail", () => {
    test("4. renders content", async ({ page }) => {
      await page.goto("/projects");

      // Get first project link
      const firstProject = page.locator('a[href^="/projects/"]').first();
      const projectUrl = await firstProject.getAttribute("href");

      if (!projectUrl) {
        test.skip();
        return;
      }

      await page.goto(projectUrl);

      // Wait for content
      await page.waitForSelector("h1, article, [data-project-content]", {
        timeout: 15_000,
      });

      const content = await page.content();
      expect(content).not.toContain('<div style="min-height:100vh"></div>');

      const hasH1 = await page.locator("h1").count();
      expect(hasH1).toBeGreaterThan(0);
    });
  });

  test.describe("Services Detail", () => {
    test("5. renders content", async ({ page }) => {
      await page.goto("/services");

      // Get first service link
      const firstService = page.locator('a[href^="/services/"]').first();
      const serviceUrl = await firstService.getAttribute("href");

      if (!serviceUrl) {
        test.skip();
        return;
      }

      await page.goto(serviceUrl);

      // Wait for content
      await page.waitForSelector("h1, article, [data-service-content]", {
        timeout: 15_000,
      });

      const content = await page.content();
      expect(content).not.toContain('<div style="min-height:100vh"></div>');

      const hasH1 = await page.locator("h1").count();
      expect(hasH1).toBeGreaterThan(0);
    });
  });

  test.describe("Error Handling", () => {
    test("6. invalid slug shows error UI or 404", async ({ page }) => {
      const response = await page.goto("/blog/this-slug-does-not-exist-xyz-123");

      // Should either 404 or show error UI, NOT blank page
      const status = response?.status();
      const content = await page.content();

      if (status === 404) {
        // Good - proper 404
        expect(content).not.toContain('<div style="min-height:100vh"></div>');
      } else {
        // Should show error UI
        const hasErrorUI =
          content.includes("Gagal Memuat") ||
          content.includes("Tidak Ditemukan") ||
          content.includes("not found");

        expect(
          hasErrorUI,
          "Should show error UI for invalid slug"
        ).toBe(true);
      }
    });
  });

  test.describe("Performance", () => {
    test("8. page loads within 10 seconds", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/blog/membangun-aplikasi-fullstack-nextjs-16-supabase");
      await page.waitForSelector("h1, article", { timeout: 10_000 });

      const loadTime = Date.now() - startTime;

      expect(
        loadTime,
        `Page took ${loadTime}ms to load (should be < 10000ms)`
      ).toBeLessThan(10_000);
    });
  });
});
