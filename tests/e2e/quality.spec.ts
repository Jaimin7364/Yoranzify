import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("public SEO endpoints and security headers are valid", async ({ page }) => {
  const home = await page.request.get("/");
  expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  const robots = await page.request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /admin/");
  expect(await (await page.request.get("/sitemap.xml")).text()).toContain("<loc>http://localhost:3000/shop</loc>");
  await page.goto("/privacy");
  await expect(page).toHaveTitle(/Privacy policy/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "http://localhost:3000/privacy");
});

test("storefront and legal page have no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  const home = await new AxeBuilder({ page }).analyze();
  expect(home.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.goto("/terms");
  const legal = await new AxeBuilder({ page }).analyze();
  expect(legal.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
});

test("private routes are noindex and authorization remains enforced", async ({ page }) => {
  const admin = await page.request.get("/admin", { maxRedirects: 0 });
  expect(admin.headers()["x-robots-tag"]).toContain("noindex");
  expect(admin.headers()["cache-control"]).toMatch(/no-store|no-cache/);
  const orders = await page.request.get("/api/admin/orders");
  expect(orders.status()).toBe(401);
  const account = await page.request.get("/api/account/orders");
  expect(account.status()).toBe(401);
});
