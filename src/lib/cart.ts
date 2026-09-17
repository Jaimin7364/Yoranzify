import { randomBytes } from "node:crypto";
import { prisma } from "./prisma";
import { tokenHash } from "./auth";
import { effectivePrice } from "./products";
import { ApiError } from "./api-error";
import type { Prisma } from "@prisma/client";
import { bestPromotion, categoryShippingPaise, validateCoupon, type CouponRule, type PromotionRule } from "./pricing";
import { isActiveOffer } from "./promotions";

export const CART_COOKIE = "yoranzify_cart";
export const CART_MAX_QUANTITY = 20;
const GUEST_CART_DAYS = 30;
const USER_CART_DAYS = 180;

const cartInclude = {
  items: {
    include: {
      variant: {
        include: {
          color: true,
          size: true,
          product: { include: { category: true, images: { include: { media: true }, orderBy: { position: "asc" as const }, take: 1 } } }
        }
      }
    },
    orderBy: { createdAt: "asc" as const }
  }
} satisfies Prisma.CartInclude;
type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;
type IncludedCartItem = CartWithItems["items"][number];
type Identity = { userId?: number | null; guestToken?: string | null };
function expiry(days: number) { return new Date(Date.now() + days * 24 * 60 * 60 * 1000); }
export function newGuestCartToken() { return randomBytes(32).toString("base64url"); }
export function mergedCartQuantity(existing: number, incoming: number, stock: number) { return Math.max(0, Math.min(existing + incoming, stock, CART_MAX_QUANTITY)); }
export function calculateCartTotals(lines: { unitPricePaise: number; quantity: number; purchasable: boolean }[], shippingChargePaise: number, freeShippingAbovePaise: number) { const subtotalPaise = lines.filter((line) => line.purchasable).reduce((sum, line) => sum + line.unitPricePaise * line.quantity, 0); const shippingPaise = subtotalPaise === 0 || subtotalPaise >= freeShippingAbovePaise ? 0 : shippingChargePaise; return { subtotalPaise, shippingPaise, totalPaise: subtotalPaise + shippingPaise, freeShippingRemainingPaise: Math.max(0, freeShippingAbovePaise - subtotalPaise) }; }

async function findCart(identity: Identity) {
  const cart = identity.userId ? await prisma.cart.findUnique({ where: { userId: identity.userId }, include: cartInclude }) : identity.guestToken ? await prisma.cart.findUnique({ where: { guestTokenHash: tokenHash(identity.guestToken) }, include: cartInclude }) : null;
  if (cart?.expiresAt && cart.expiresAt <= new Date()) { await prisma.cart.delete({ where: { id: cart.id } }); return null; }
  return cart;
}

async function ensureCart(identity: Identity) {
  const existing = await findCart(identity); if (existing) return existing;
  if (!identity.userId && !identity.guestToken) throw new ApiError(400, "CART_IDENTITY_REQUIRED", "A cart identity is required.");
  return prisma.cart.create({ data: identity.userId ? { userId: identity.userId, expiresAt: expiry(USER_CART_DAYS) } : { guestTokenHash: tokenHash(identity.guestToken!), expiresAt: expiry(GUEST_CART_DAYS) }, include: cartInclude });
}

function currentUnitPrice(item: IncludedCartItem) { return effectivePrice(item.variant.product.regularPricePaise, item.variant.product.salePricePaise, item.variant.priceOverridePaise); }
export async function cartSnapshot(identity: Identity, shippingChargePaise = 9900, freeShippingAbovePaise = 199900, platformFeePaise?: number) {
  const effectivePlatformFeePaise = platformFeePaise ?? (await prisma.siteSetting.findUnique({ where: { id: 1 }, select: { platformFeePaise: true } }))?.platformFeePaise ?? 0;
  const cart = await findCart(identity); if (!cart) return { id: null, items: [], itemCount: 0, subtotalPaise: 0, automaticDiscountPaise: 0, coupon: null, couponDiscountPaise: 0, discountedSubtotalPaise: 0, shippingPaise: 0, platformFeePaise: 0, freeShippingAbovePaise, freeShippingRemainingPaise: freeShippingAbovePaise, totalPaise: 0 };
  const now = new Date(); const rawPromotions = await prisma.promotion.findMany({ where: { enabled: true }, include: { products: true, categories: true } });
  const promotions: PromotionRule[] = rawPromotions.filter((offer) => isActiveOffer(offer, now)).map((offer) => ({ ...offer, productIds: offer.products.map((target) => target.productId), categoryIds: offer.categories.map((target) => target.categoryId) }));
  const items = cart.items.map((item) => { const unitPricePaise = currentUnitPrice(item); const available = item.variant.isActive && item.variant.product.status === "ACTIVE" && !item.variant.product.archivedAt && item.variant.product.category.isVisible && !item.variant.product.category.archivedAt; const allowedQuantity = available ? Math.min(item.variant.stockQuantity, CART_MAX_QUANTITY) : 0; const grossLinePaise = unitPricePaise * item.quantity; const automatic = bestPromotion(grossLinePaise, item.variant.productId, item.variant.product.categoryId, promotions); return { id: item.id, variantId: item.variantId, quantity: item.quantity, allowedQuantity, available, stockChanged: item.quantity > allowedQuantity, priceChanged: item.lastSeenUnitPricePaise !== unitPricePaise, previousUnitPricePaise: item.lastSeenUnitPricePaise, unitPricePaise, automaticDiscountPaise: automatic?.discountPaise ?? 0, promotionName: automatic?.promotion.name ?? null, lineTotalPaise: grossLinePaise - (automatic?.discountPaise ?? 0), sku: item.variant.sku, color: item.variant.color.name, size: item.variant.size.name, product: { name: item.variant.product.name, slug: item.variant.product.slug, imageUrl: item.variant.product.images[0] ? `/api/media/${item.variant.product.images[0].media.id}` : null } }; });
  const eligible = items.filter((item) => item.available && !item.stockChanged); const merchandiseSubtotalPaise = eligible.reduce((sum, item) => sum + item.unitPricePaise * item.quantity, 0); const automaticDiscountPaise = eligible.reduce((sum, item) => sum + item.automaticDiscountPaise, 0); const subtotalAfterPromotions = merchandiseSubtotalPaise - automaticDiscountPaise;
  let coupon = null; let couponDiscountPaise = 0; let couponError: { code: string; message: string } | null = null;
  if (cart.couponId) { const stored = await prisma.coupon.findUnique({ where: { id: cart.couponId }, include: { customers: true, usages: { where: { status: { in: ["RESERVED", "REDEEMED"] } } } } }); if (stored && isActiveOffer(stored, now)) { const rule: CouponRule = { ...stored, name: stored.code, customerIds: stored.customers.map((entry) => entry.userId), totalUsage: stored.usages.length, userUsage: identity.userId ? stored.usages.filter((entry) => entry.userId === identity.userId).length : 0 }; try { couponDiscountPaise = validateCoupon(rule, subtotalAfterPromotions, identity.userId); coupon = { code: stored.code, description: stored.description }; } catch (error) { couponError = error instanceof ApiError ? { code: error.code, message: error.message } : { code: "COUPON_NOT_APPLICABLE", message: "This coupon is not applicable to your current bag." }; await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } }); } } else { couponError = { code: "COUPON_INVALID", message: "This coupon is invalid or no longer active." }; await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } }); } }
  const discountedSubtotalPaise = subtotalAfterPromotions - couponDiscountPaise; const shippingPaise = categoryShippingPaise(cart.items.filter((raw) => eligible.some((item) => item.id === raw.id)).map((raw) => ({ categoryId: raw.variant.product.categoryId, subtotalPaise: items.find((item) => item.id === raw.id)?.lineTotalPaise ?? 0, shippingChargePaise: raw.variant.product.category.shippingChargePaise, freeShippingAbovePaise: raw.variant.product.category.freeShippingAbovePaise })), shippingChargePaise, freeShippingAbovePaise); const chargedPlatformFeePaise = discountedSubtotalPaise > 0 ? effectivePlatformFeePaise : 0; const totalPaise = discountedSubtotalPaise + shippingPaise + chargedPlatformFeePaise; const freeShippingRemainingPaise = Math.max(0, freeShippingAbovePaise - discountedSubtotalPaise); const subtotalPaise = merchandiseSubtotalPaise;
  await prisma.cart.update({ where: { id: cart.id }, data: { expiresAt: expiry(identity.userId ? USER_CART_DAYS : GUEST_CART_DAYS), items: { updateMany: items.map((item) => ({ where: { id: item.id }, data: { lastSeenUnitPricePaise: item.unitPricePaise } })) } } });
  return { id: cart.id, items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), subtotalPaise, automaticDiscountPaise, coupon, couponError, couponDiscountPaise, discountedSubtotalPaise, shippingPaise, platformFeePaise: chargedPlatformFeePaise, freeShippingAbovePaise, freeShippingRemainingPaise, totalPaise };
}

export async function applyCartCoupon(identity: Identity, rawCode: string) { const cart = await findCart(identity); if (!cart?.items.length) throw new ApiError(409, "EMPTY_CART", "Add an item before applying a coupon."); const code = rawCode.trim().toUpperCase(); const coupon = await prisma.coupon.findUnique({ where: { code } }); if (!coupon || !isActiveOffer(coupon)) throw new ApiError(404, "COUPON_INVALID", "This coupon is invalid or no longer active."); await prisma.cart.update({ where: { id: cart.id }, data: { couponId: coupon.id } }); }
export async function removeCartCoupon(identity: Identity) { const cart = await findCart(identity); if (cart) await prisma.cart.update({ where: { id: cart.id }, data: { couponId: null } }); }

export async function addCartItem(identity: Identity, variantId: number, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > CART_MAX_QUANTITY) throw new ApiError(400, "INVALID_QUANTITY", `Choose between 1 and ${CART_MAX_QUANTITY} items.`);
  const variant = await prisma.productVariant.findFirst({ where: { id: variantId, isActive: true, product: { status: "ACTIVE", archivedAt: null, category: { isVisible: true, archivedAt: null } } }, include: { product: true } });
  if (!variant || variant.stockQuantity < 1) throw new ApiError(409, "VARIANT_UNAVAILABLE", "This option is currently unavailable.");
  const cart = await ensureCart(identity); const existing = await prisma.cartItem.findUnique({ where: { cartId_variantId: { cartId: cart.id, variantId } } }); const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (nextQuantity > Math.min(variant.stockQuantity, CART_MAX_QUANTITY)) throw new ApiError(409, "QUANTITY_UNAVAILABLE", `Only ${Math.min(variant.stockQuantity, CART_MAX_QUANTITY)} available.`);
  const price = effectivePrice(variant.product.regularPricePaise, variant.product.salePricePaise, variant.priceOverridePaise);
  await prisma.cartItem.upsert({ where: { cartId_variantId: { cartId: cart.id, variantId } }, update: { quantity: nextQuantity }, create: { cartId: cart.id, variantId, quantity, lastSeenUnitPricePaise: price } });
}

export async function updateCartItem(identity: Identity, itemId: number, quantity: number) { const cart = await findCart(identity); const item = cart?.items.find((entry) => entry.id === itemId); if (!item) throw new ApiError(404, "CART_ITEM_NOT_FOUND", "Cart item not found."); if (!Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(item.variant.stockQuantity, CART_MAX_QUANTITY)) throw new ApiError(409, "QUANTITY_UNAVAILABLE", `Only ${Math.min(item.variant.stockQuantity, CART_MAX_QUANTITY)} available.`); await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } }); }
export async function removeCartItem(identity: Identity, itemId: number) { const cart = await findCart(identity); if (!cart?.items.some((item) => item.id === itemId)) throw new ApiError(404, "CART_ITEM_NOT_FOUND", "Cart item not found."); await prisma.cartItem.delete({ where: { id: itemId } }); }
export async function clearCart(identity: Identity) { const cart = await findCart(identity); if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } }); }

export async function mergeGuestCart(userId: number, guestToken?: string | null) {
  if (!guestToken) return; const guestHash = tokenHash(guestToken);
  await prisma.$transaction(async (tx) => { const guest = await tx.cart.findUnique({ where: { guestTokenHash: guestHash }, include: { items: { include: { variant: { include: { product: true } } } } } }); if (!guest) return; const owned = await tx.cart.findUnique({ where: { userId } }); if (!owned) { await tx.cart.update({ where: { id: guest.id }, data: { userId, guestTokenHash: null, expiresAt: expiry(USER_CART_DAYS) } }); return; } for (const item of guest.items) { const current = await tx.cartItem.findUnique({ where: { cartId_variantId: { cartId: owned.id, variantId: item.variantId } } }); const quantity = mergedCartQuantity(current?.quantity ?? 0, item.quantity, item.variant.stockQuantity); if (quantity > 0) await tx.cartItem.upsert({ where: { cartId_variantId: { cartId: owned.id, variantId: item.variantId } }, update: { quantity }, create: { cartId: owned.id, variantId: item.variantId, quantity, lastSeenUnitPricePaise: effectivePrice(item.variant.product.regularPricePaise, item.variant.product.salePricePaise, item.variant.priceOverridePaise) } }); } await tx.cart.delete({ where: { id: guest.id } }); });
}
