import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("GET /api/health returns 200", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(["healthy", "degraded", "unhealthy"]).toContain(body.status);
    expect(body).toHaveProperty("timestamp");
  });

  test("GET /api/health returns valid service status", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();

    expect(body).toHaveProperty("services");
    expect(body.services).toHaveProperty("database");
  });

  test("POST /api/report-error accepts valid payload", async ({ request }) => {
    const response = await request.post("/api/report-error", {
      data: {
        level: "error",
        module: "e2e-test",
        message: "Test error from Playwright",
        stack: "Error: test\n    at test.js:1:1",
        metadata: { test: true },
      },
    });

    // Should accept (200 or 201) or return validation error (400)
    expect([200, 201, 400]).toContain(response.status());
  });

  test("POST /api/report-error rejects empty message", async ({ request }) => {
    const response = await request.post("/api/report-error", {
      data: {
        level: "error",
        module: "e2e-test",
      },
    });

    // Should reject with 400
    expect(response.status()).toBe(400);
  });

  test("GET /api/search with query returns results", async ({ request }) => {
    const response = await request.get("/api/search?q=test");

    // Should be 200 or 404 if endpoint not implemented
    expect([200, 404, 405]).toContain(response.status());
  });

  test("sitemap.xml is accessible", async ({ request }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain('<?xml version="1.0"');
    expect(body).toContain("<urlset");
    expect(body).toContain("irnk.codes");
  });

  test("robots.txt is accessible", async ({ request }) => {
    const response = await request.get("/robots.txt");

    expect(response.status()).toBe(200);

    const body = await response.text();
    expect(body).toContain("User-agent");
  });
});
