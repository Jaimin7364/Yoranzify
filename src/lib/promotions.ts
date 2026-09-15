import { z } from "zod";
import { prisma } from "./prisma";
import { ApiError } from "./api-error";
import type { DiscountType, Prisma } from "@prisma/client";

const optionalDate = z.union([z.string().datetime(), z.literal(""), z.null()]).optional().transform((value) => value ? new Date(value) : null);
const baseSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(255).nullish().transform((value) => value || null),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  discountValue: z.number().int().positive(),
  maximumDiscountPaise: z.number().int().positive().nullable().optional(),
  enabled: z.boolean().default(true),
  startsAt: optionalDate,
  endsAt: optionalDate
}).superRefine((value, ctx) => {
  if (value.discountType === "PERCENTAGE" && value.discountValue > 100) ctx.addIssue({ code: "custom", path: ["discountValue"], message: "Percentage cannot exceed 100." });
  if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End must be after start." });
});

export const couponSchema = z.intersection(baseSchema, z.object({
  code: z.string().trim().min(3).max(40).regex(/^[A-Za-z0-9_-]+$/).transform((value) => value.toUpperCase()),
  minimumSpendPaise: z.number().int().min(0).default(0),
  firstOrderOnly: z.boolean().default(false),
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().nullable().optional(),
  customerIds: z.array(z.number().int().positive()).default([])
}));

export const promotionSchema = z.intersection(baseSchema, z.object({
  productIds: z.array(z.number().int().positive()).default([]),
  categoryIds: z.array(z.number().int().positive()).default([])
})).superRefine((value, ctx) => {
  if (!value.productIds.length && !value.categoryIds.length) ctx.addIssue({ code: "custom", path: ["productIds"], message: "Choose at least one product or category." });
});

export function activeWindow(now = new Date()): Prisma.DateTimeFilter { return { lte: now }; }
export function isActiveOffer(offer: { enabled: boolean; startsAt: Date | null; endsAt: Date | null }, now = new Date()) { return offer.enabled && (!offer.startsAt || offer.startsAt <= now) && (!offer.endsAt || offer.endsAt >= now); }
export function offerState(offer: { enabled: boolean; startsAt: Date | null; endsAt: Date | null }, now = new Date()) { if (!offer.enabled) return "DISABLED"; if (offer.startsAt && offer.startsAt > now) return "SCHEDULED"; if (offer.endsAt && offer.endsAt < now) return "EXPIRED"; return "ACTIVE"; }

export async function saveCoupon(raw: unknown, id?: number) {
  const input = couponSchema.parse(raw);
  const fields = { code: input.code, description: input.description, discountType: input.discountType as DiscountType, discountValue: input.discountValue, maximumDiscountPaise: input.maximumDiscountPaise ?? null, minimumSpendPaise: input.minimumSpendPaise, firstOrderOnly: input.firstOrderOnly, usageLimit: input.usageLimit ?? null, perUserLimit: input.perUserLimit ?? null, enabled: input.enabled, startsAt: input.startsAt, endsAt: input.endsAt };
  try { return id ? await prisma.coupon.update({ where: { id }, data: { ...fields, customers: { deleteMany: {}, create: input.customerIds.map((userId) => ({ userId })) } }, include: couponInclude }) : await prisma.coupon.create({ data: { ...fields, customers: { create: input.customerIds.map((userId) => ({ userId })) } }, include: couponInclude }); }
  catch (error) { if ((error as { code?: string }).code === "P2002") throw new ApiError(409, "COUPON_CODE_EXISTS", "A coupon with this code already exists."); throw error; }
}

export async function savePromotion(raw: unknown, id?: number) {
  const input = promotionSchema.parse(raw);
  const fields = { name: input.name, description: input.description, discountType: input.discountType as DiscountType, discountValue: input.discountValue, maximumDiscountPaise: input.maximumDiscountPaise ?? null, enabled: input.enabled, startsAt: input.startsAt, endsAt: input.endsAt };
  return id ? prisma.promotion.update({ where: { id }, data: { ...fields, products: { deleteMany: {}, create: input.productIds.map((productId) => ({ productId })) }, categories: { deleteMany: {}, create: input.categoryIds.map((categoryId) => ({ categoryId })) } }, include: promotionInclude }) : prisma.promotion.create({ data: { ...fields, products: { create: input.productIds.map((productId) => ({ productId })) }, categories: { create: input.categoryIds.map((categoryId) => ({ categoryId })) } }, include: promotionInclude });
}

export const couponInclude = { customers: true, _count: { select: { usages: true } } } satisfies Prisma.CouponInclude;
export const promotionInclude = { products: true, categories: true } satisfies Prisma.PromotionInclude;
