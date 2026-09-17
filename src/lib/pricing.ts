import { ApiError } from "./api-error";

export type DiscountRule = {
  id: number;
  name: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maximumDiscountPaise?: number | null;
};

export type PromotionRule = DiscountRule & {
  productIds: number[];
  categoryIds: number[];
};

export type CouponRule = DiscountRule & {
  code: string;
  minimumSpendPaise: number;
  firstOrderOnly: boolean;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  totalUsage: number;
  userUsage: number;
  customerIds: number[];
};

export function discountPaise(amountPaise: number, rule: DiscountRule) {
  const raw = rule.discountType === "PERCENTAGE"
    ? Math.round(amountPaise * rule.discountValue / 100)
    : rule.discountValue;
  return Math.max(0, Math.min(amountPaise, raw, rule.maximumDiscountPaise ?? Number.MAX_SAFE_INTEGER));
}

export function bestPromotion(amountPaise: number, productId: number, categoryId: number, promotions: PromotionRule[]) {
  return promotions
    .filter((promotion) => promotion.productIds.includes(productId) || promotion.categoryIds.includes(categoryId))
    .map((promotion) => ({ promotion, discountPaise: discountPaise(amountPaise, promotion) }))
    .sort((a, b) => b.discountPaise - a.discountPaise || a.promotion.id - b.promotion.id)[0] ?? null;
}

export function validateCoupon(coupon: CouponRule, subtotalPaise: number, userId?: number | null) {
  if (subtotalPaise < coupon.minimumSpendPaise) throw new ApiError(409, "COUPON_MINIMUM_NOT_MET", `Add ₹${((coupon.minimumSpendPaise - subtotalPaise) / 100).toLocaleString("en-IN")} more to use this code.`);
  if (coupon.customerIds.length && (!userId || !coupon.customerIds.includes(userId))) throw new ApiError(403, "COUPON_NOT_ELIGIBLE", "This coupon is reserved for selected customers.");
  if (coupon.firstOrderOnly && coupon.userUsage > 0) throw new ApiError(409, "COUPON_FIRST_ORDER_ONLY", "This code is only available on a first order.");
  if (coupon.usageLimit != null && coupon.totalUsage >= coupon.usageLimit) throw new ApiError(409, "COUPON_LIMIT_REACHED", "This coupon has reached its usage limit.");
  if (coupon.perUserLimit != null && coupon.userUsage >= coupon.perUserLimit) throw new ApiError(409, "COUPON_USER_LIMIT_REACHED", "You have already used this coupon the maximum number of times.");
  return discountPaise(subtotalPaise, coupon);
}

export function categoryShippingPaise(lines: { categoryId: number; subtotalPaise: number; shippingChargePaise: number | null; freeShippingAbovePaise: number | null }[], defaultCharge: number, defaultThreshold: number) { const totals = new Map<number, { subtotal: number; charge: number; threshold: number }>(); for (const line of lines) { const current = totals.get(line.categoryId) ?? { subtotal: 0, charge: line.shippingChargePaise ?? defaultCharge, threshold: line.freeShippingAbovePaise ?? defaultThreshold }; current.subtotal += line.subtotalPaise; totals.set(line.categoryId, current); } return Math.max(0, ...[...totals.values()].map((rule) => rule.subtotal >= rule.threshold ? 0 : rule.charge)); }
