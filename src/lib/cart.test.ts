import { describe, expect, it } from "vitest";
import { calculateCartTotals, mergedCartQuantity } from "./cart";
describe("cart rules", () => {
  it("merges duplicate quantities within stock and the cart limit", () => { expect(mergedCartQuantity(2, 3, 10)).toBe(5); expect(mergedCartQuantity(18, 5, 50)).toBe(20); expect(mergedCartQuantity(3, 4, 5)).toBe(5); });
  it("uses integer paise and adds shipping below the threshold", () => { expect(calculateCartTotals([{ unitPricePaise: 89950, quantity: 2, purchasable: true }], 9900, 199900)).toEqual({ subtotalPaise: 179900, shippingPaise: 9900, totalPaise: 189800, freeShippingRemainingPaise: 20000 }); });
  it("excludes unavailable lines and unlocks free shipping", () => { expect(calculateCartTotals([{ unitPricePaise: 250000, quantity: 1, purchasable: true }, { unitPricePaise: 50000, quantity: 2, purchasable: false }], 9900, 199900)).toEqual({ subtotalPaise: 250000, shippingPaise: 0, totalPaise: 250000, freeShippingRemainingPaise: 0 }); });
});
