import { describe, expect, it } from "vitest";
import { canonicalCatalogueQuery, parseCatalogueParams } from "./catalogue";

describe("catalogue query parameters", () => {
  it("normalizes search, arrays, money and invalid values", () => { const value = parseCatalogueParams({ q: "  linen   shirt ", size: ["L", "M"], minPrice: "999.50", sort: "wrong", page: "-4" }); expect(value).toMatchObject({ q: "linen shirt", sizes: ["L", "M"], minPrice: 99950, sort: "newest", page: 1 }); });
  it("creates a stable shareable query without defaults", () => { const value = parseCatalogueParams({ color: ["White", "Black"], gender: "women", sort: "price-asc", page: "2" }); expect(canonicalCatalogueQuery(value)).toBe("gender=women&color=Black&color=White&sort=price-asc&page=2"); });
  it("caps unsafe and excessive input", () => { const value = parseCatalogueParams({ q: " x  ".repeat(100), page: "99999", minPrice: "not-money" }); expect(value.q.length).toBeLessThanOrEqual(100); expect(value.page).toBe(1000); expect(value.minPrice).toBeNull(); });
});
