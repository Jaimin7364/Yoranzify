import { describe, expect, it } from "vitest";
import { settingsInputSchema } from "./settings";

const valid = { storeName: "Yoranzify", contactNumber: "9876543210", whatsappNumber: "", contactEmail: "hello@example.com", address: "Ahmedabad", instagramUrl: "https://instagram.com/yoranzify", facebookUrl: "", gstNumber: "", currency: "INR", shippingChargeRupees: 99, freeShippingAboveRupees: 1999, lowStockThreshold: 5, codEnabled: true, maintenanceMode: false, logoMediaId: null, faviconMediaId: null };

describe("settingsInputSchema", () => {
  it("normalizes optional settings", () => {
    const result = settingsInputSchema.parse(valid);
    expect(result.whatsappNumber).toBeNull();
    expect(result.facebookUrl).toBeNull();
  });

  it("rejects negative money and unsafe URLs", () => {
    expect(settingsInputSchema.safeParse({ ...valid, shippingChargeRupees: -1 }).success).toBe(false);
    expect(settingsInputSchema.safeParse({ ...valid, instagramUrl: "javascript:alert(1)" }).success).toBe(false);
  });

  it("validates GST format when supplied", () => {
    expect(settingsInputSchema.safeParse({ ...valid, gstNumber: "24ABCDE1234F1Z5" }).success).toBe(true);
    expect(settingsInputSchema.safeParse({ ...valid, gstNumber: "bad-gst" }).success).toBe(false);
  });
});
