import { describe, expect, it } from "vitest";
import { couponSchema, isActiveOffer, offerState, promotionSchema } from "./promotions";

describe("offer validation", () => {
  it("normalizes coupon codes and rejects percentages above 100", () => {
    expect(couponSchema.parse({ name: "Welcome", code: " welcome10 ", discountType: "PERCENTAGE", discountValue: 10 }).code).toBe("WELCOME10");
    expect(() => couponSchema.parse({ name: "Bad offer", code: "BAD", discountType: "PERCENTAGE", discountValue: 101 })).toThrow();
  });
  it("requires an automatic promotion target", () => expect(() => promotionSchema.parse({ name: "Sale", discountType: "FLAT", discountValue: 5000 })).toThrow());
  it("handles boundary dates", () => {
    const now = new Date("2026-09-13T12:00:00Z");
    expect(isActiveOffer({ enabled: true, startsAt: now, endsAt: now }, now)).toBe(true);
    expect(offerState({ enabled: true, startsAt: new Date("2026-09-14T00:00:00Z"), endsAt: null }, now)).toBe("SCHEDULED");
    expect(offerState({ enabled: true, startsAt: null, endsAt: new Date("2026-09-12T00:00:00Z") }, now)).toBe("EXPIRED");
  });
});
