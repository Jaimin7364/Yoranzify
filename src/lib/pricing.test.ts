import { describe, expect, it } from "vitest";
import { bestPromotion, categoryShippingPaise, discountPaise, validateCoupon } from "./pricing";

const coupon = { id: 1, name: "Welcome", code: "WELCOME10", discountType: "PERCENTAGE" as const, discountValue: 10, maximumDiscountPaise: 50000, minimumSpendPaise: 100000, firstOrderOnly: false, usageLimit: 100, perUserLimit: 1, totalUsage: 2, userUsage: 0, customerIds: [] };

describe("central pricing", () => {
  it("charges the highest applicable category shipping fee once", () => {
    expect(categoryShippingPaise([{ categoryId: 1, subtotalPaise: 80000, shippingChargePaise: 8000, freeShippingAbovePaise: 100000 }, { categoryId: 2, subtotalPaise: 90000, shippingChargePaise: 12000, freeShippingAbovePaise: 150000 }], 9900, 199900)).toBe(12000);
    expect(categoryShippingPaise([{ categoryId: 1, subtotalPaise: 100000, shippingChargePaise: 8000, freeShippingAbovePaise: 100000 }], 9900, 199900)).toBe(0);
  });
  it("rounds percentage discounts in paise and applies caps", () => {
    expect(discountPaise(999, { ...coupon, discountValue: 10 })).toBe(100);
    expect(discountPaise(900000, coupon)).toBe(50000);
  });
  it("chooses only the best applicable automatic promotion", () => {
    const result = bestPromotion(100000, 5, 9, [{ id: 1, name: "Category", discountType: "PERCENTAGE", discountValue: 10, productIds: [], categoryIds: [9] }, { id: 2, name: "Product", discountType: "FLAT", discountValue: 15000, productIds: [5], categoryIds: [] }]);
    expect(result?.promotion.name).toBe("Product");
    expect(result?.discountPaise).toBe(15000);
  });
  it("enforces minimum spend, targeting, and usage boundaries", () => {
    expect(() => validateCoupon(coupon, 99999, 4)).toThrow(/Add/);
    expect(() => validateCoupon({ ...coupon, customerIds: [7] }, 100000, 4)).toThrow(/selected/);
    expect(() => validateCoupon({ ...coupon, userUsage: 1 }, 100000, 4)).toThrow(/maximum/);
    expect(validateCoupon(coupon, 200000, 4)).toBe(20000);
  });
});
