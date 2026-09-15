import { describe, expect, it } from "vitest";
import { bannerSchema, isBannerActive } from "./homepage-cms";

const banner = { desktopMediaId: 1, mobileMediaId: null, altText: "Model in autumn tailoring", title: "Autumn tailoring", subtitle: "", buttonText: "Shop now", buttonUrl: "/shop", position: 0, startsAt: null, endsAt: null, enabled: true };
describe("homepage CMS", () => {
  it("uses inclusive starts and exclusive ends while excluding unavailable banners", () => { const now = new Date("2026-09-14T06:00:00.000Z"); expect(isBannerActive({ enabled: true, startsAt: now, endsAt: new Date("2026-09-14T07:00:00.000Z") }, now)).toBe(true); expect(isBannerActive({ enabled: true, startsAt: null, endsAt: now }, now)).toBe(false); expect(isBannerActive({ enabled: true, startsAt: new Date("2026-09-14T07:00:00.000Z"), endsAt: null }, now)).toBe(false); expect(isBannerActive({ enabled: false, startsAt: null, endsAt: null }, now)).toBe(false); });
  it("rejects unsafe links and inverted schedules", () => { expect(() => bannerSchema.parse({ ...banner, buttonUrl: "javascript:alert(1)" })).toThrow(); expect(() => bannerSchema.parse({ ...banner, startsAt: "2026-09-15T00:00:00.000Z", endsAt: "2026-09-14T00:00:00.000Z" })).toThrow(); });
  it("accepts internal and HTTPS links", () => { expect(bannerSchema.parse(banner).buttonUrl).toBe("/shop"); expect(bannerSchema.parse({ ...banner, buttonUrl: "https://example.com/edit" }).buttonUrl).toContain("https://"); });
});
