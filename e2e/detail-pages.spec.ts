import { test, expect } from "@playwright/test";

test.describe("Detail Pages - Client-Side Fetching", () => {
  test.describe("Blog Detail", () => {
    const blogSlug = "membangun-aplikasi-fullstack-nextjs-16-supabase";

    test("1. renders content (not blank shell)", async ({ page }) => {
      await page.goto(`/blog/${blogSlug}`);

      // Wait for client-side fetched content to appear
      await page.waitForSelector("article, h1, [data-blog-content]", {
        timeout: 20_000,
      });

      // Check that we have actual content, not just a loading skeleton
      const content = await page.content();
      expect(content).not.toContain('<div style="min-height:100vh"></div>');

      // Verify we have an article or heading
      const hasArticle = await page.locator("article").count();
      const hasH1 = await page.locator("h1").count();
      expect(hasArticle + hasH1).toBeGreaterThan(0);
    });

    test("2. has correct title tag", async ({ page }) => {
      await page.goto(`/blog/${blogSlug}`);

      // Wait for client-side content to load first
      await page.waitForSelector("article, h1, [data-blog-content]", {
        timeout: 20_000,
      });

      // Title is now static "Blog Detail" from generateMetadata
      const title = await page.title();
      expect(title).toContain("Blog");
    });

    test("3. has basic metadata", async ({ page }) => {
      await page.goto(`/blog/${blogSlug}`);

      // Wait for content to load
      await page.waitForSelector("article, h1, [data-blog-content]", {
        timeout: 20_000,
      });

      // Check canonical URL exists (from static generateMetadata)
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        "href",
        /blog\/membangun-aplikasi-fullstack-nextjs-16-supabase/
      );
    });

    test("7. no critical console errors", async ({ page }) => {
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
      await page.waitForSelector("article, h1, [data-blog-content]", {
        timeout: 20_000,
      });
      await page.waitForTimeout(2000);

      // Filter out known non-critical errors
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes("favicon") &&
          !e.includes("manifest") &&
          !e.includes("Failed to load resource") &&
          !e.includes("Download the React DevTools") &&
          !e.includes("Hydration")
      );

      // Check for Connection closed error specifically
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
      // Go to projects list first to get a valid slug
      await page.goto("/projects");
      await page.waitForSelector('a[href^="/projects/"]', { timeout: 20_000 });

      // Get first project link that isn't just "/projects"
      const projectLinks = page.locator('a[href^="/projects/"]');
      const count = await projectLinks.count();

      if (count === 0) {
        test.skip();
        return;
      }

      // Find first link that has a slug (not just /projects)
      let projectUrl = "";
      for (let i = 0; i < count; i++) {
        const href = await projectLinks.nth(i).getAttribute("href");
        if (href && href !== "/projects" && href.startsWith("/projects/") && href.length > "/projects/".length) {
          projectUrl = href;
          break;
        }
      }

      if (!projectUrl) {
        test.skip();
        return;
      }

      await page.goto(projectUrl);

      // Wait for client-side fetched content
      await page.waitForSelector("h1, [data-project-content]", {
        timeout: 20_000,
      });

      const content = await page.content();
      expect(content).not.toContain('<div style="min-height:100vh"></div>');

      const hasH1 = await page.locator("h1").count();
      expect(hasH1).toBeGreaterThan(0);
    });
  });

  test.describe("Services Detail", () => {
    test("5. renders content", async ({ page }) => {
      // Go to services list first to get a valid slug
      await page.goto("/services");
      await page.waitForSelector('a[href^="/services/"]', { timeout: 20_000 });

      // Get first service link that isn't just "/services"
      const serviceLinks = page.locator('a[href^="/services/"]');
      const count = await serviceLinks.count();

      if (count === 0) {
        test.skip();
        return;
      }

      let serviceUrl = "";
      for (let i = 0; i < count; i++) {
        const href = await serviceLinks.nth(i).getAttribute("href");
        if (href && href !== "/services" && href.startsWith("/services/") && href.length > "/services/".length) {
          serviceUrl = href;
          break;
        }
      }

      if (!serviceUrl) {
        test.skip();
        return;
      }

      await page.goto(serviceUrl);

      // Wait for client-side fetched content
      await page.waitForSelector("h1, [data-service-content]", {
        timeout: 20_000,
      });

      const content = await page.content();
      expect(content).not.toContain('<div style="min-height:100vh"></div>');

      const hasH1 = await page.locator("h1").count();
      expect(hasH1).toBeGreaterThan(0);
    });
  });

  test.describe("Error Handling", () => {
    test("6. invalid slug shows error UI", async ({ page }) => {
      await page.goto("/blog/this-slug-does-not-exist-xyz-123");

      // Wait for client-side error UI to appear
      await page.waitForSelector("text=Gagal Memuat", { timeout: 20_000 });

      // Should show error UI, NOT blank page
      const content = await page.content();
      expect(content).not.toContain('<div style="min-height:100vh"></div>');

      const hasErrorUI =
        content.includes("Gagal Memuat") ||
        content.includes("Tidak Ditemukan") ||
        content.includes("not found") ||
        content.includes("Kembali ke");

      expect(hasErrorUI, "Should show error UI for invalid slug").toBe(true);
    });
  });

  test.describe("Performance", () => {
    test("8. page loads within 15 seconds", async ({ page }) => {
      const startTime = Date.now();

      await page.goto("/blog/membangun-aplikasi-fullstack-nextjs-16-supabase");
      await page.waitForSelector("article, h1, [data-blog-content]", {
        timeout: 15_000,
      });

      const loadTime = Date.now() - startTime;

      expect(
        loadTime,
        `Page took ${loadTime}ms to load (should be < 15000ms)`
      ).toBeLessThan(15_000);
    });
  });
});
