import { describe, expect, it } from "vitest";
import { calculateDiscountPercent, effectivePrice, productInputSchema } from "./products";

const base = { name: "Oversized Tee", slug: "", skuReference: "TEE-OVR", shortDescription: "Soft cotton", description: "", categoryId: 1, brand: "Yoranzify", gender: "UNISEX", regularPriceRupees: 1299, salePriceRupees: 899, gstPercent: 5, hsnCode: "6109", status: "ACTIVE", isFeatured: false, isBestSeller: false, isNewArrival: true, seoTitle: "", seoDescription: "", images: [], variants: [{ colorName: "Black", colorHex: "#171814", sizeName: "M", sku: "TEE-BLK-M", priceOverrideRupees: null, stockQuantity: 10, lowStockThreshold: null, weightGrams: null, isActive: true }] };

describe("product rules", () => {
  it("calculates discounts and effective variant prices", () => { expect(calculateDiscountPercent(129900, 89900)).toBe(31); expect(effectivePrice(129900, 89900, null)).toBe(89900); expect(effectivePrice(129900, 89900, 99900)).toBe(99900); });
  it("accepts a valid variant-level product", () => { expect(productInputSchema.safeParse(base).success).toBe(true); });
  it("rejects a sale price above regular price", () => { expect(productInputSchema.safeParse({ ...base, salePriceRupees: 1400 }).success).toBe(false); });
  it("rejects duplicate SKUs and colour-size pairs", () => { const duplicate = { ...base, variants: [base.variants[0], { ...base.variants[0] }] }; expect(productInputSchema.safeParse(duplicate).success).toBe(false); });
  it("rejects negative variant stock", () => { expect(productInputSchema.safeParse({ ...base, variants: [{ ...base.variants[0], stockQuantity: -1 }] }).success).toBe(false); });
  it("accepts an admin-defined colour", () => { expect(productInputSchema.safeParse({ ...base, variants: [{ ...base.variants[0], colorName: "Midnight Blue", colorHex: "#19324D" }] }).success).toBe(true); });
  it("rejects an invalid custom colour value", () => { expect(productInputSchema.safeParse({ ...base, variants: [{ ...base.variants[0], colorName: "Midnight Blue", colorHex: "blue" }] }).success).toBe(false); });
});
