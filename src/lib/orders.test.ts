import { describe, expect, it } from "vitest";
import { canTransition, checkoutSchema, taxIncludedPaise } from "./orders";
describe("orders", () => {
  it("accepts only retry-safe checkout input", () => { expect(checkoutSchema.safeParse({ addressId: 1, paymentMethod: "COD", idempotencyKey: "1234567890abcdef" }).success).toBe(true); expect(checkoutSchema.safeParse({ addressId: 1, paymentMethod: "RAZORPAY", idempotencyKey: "short" }).success).toBe(false); });
  it("calculates tax included in a paise total", () => expect(taxIncludedPaise(11800, 18)).toBe(1800));
  it("allows only the defined order status path", () => { expect(canTransition("PLACED", "CONFIRMED")).toBe(true); expect(canTransition("PLACED", "SHIPPED")).toBe(false); expect(canTransition("PACKED", "CANCELLED")).toBe(false); });
});
