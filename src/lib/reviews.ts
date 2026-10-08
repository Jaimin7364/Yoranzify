import { z } from "zod";
import { prisma } from "./prisma";
import { ApiError } from "./api-error";

export const reviewInputSchema = z.object({ orderItemId: z.number().int().positive(), rating: z.number().int().min(1).max(5), title: z.string().trim().max(120).default(""), comment: z.string().trim().min(10, "Write at least 10 characters").max(2000) });
export const reviewModerationSchema = z.object({ status: z.enum(["APPROVED", "HIDDEN"]) });

export async function saveCustomerReview(userId: number, raw: unknown) {
  const input = reviewInputSchema.parse(raw);
  const item = await prisma.orderItem.findFirst({ where: { id: input.orderItemId, order: { userId, status: "DELIVERED" } }, select: { id: true, productId: true } });
  if (!item) throw new ApiError(403, "REVIEW_NOT_ALLOWED", "You can review this product after its order is delivered.");
  return prisma.review.upsert({ where: { orderItemId: item.id }, update: { rating: input.rating, title: input.title || null, comment: input.comment, status: "PENDING" }, create: { userId, productId: item.productId, orderItemId: item.id, rating: input.rating, title: input.title || null, comment: input.comment } });
}

export async function moderateReview(id: number, raw: unknown) {
  const input = reviewModerationSchema.parse(raw);
  if (!await prisma.review.findUnique({ where: { id } })) throw new ApiError(404, "REVIEW_NOT_FOUND", "Review not found.");
  return prisma.review.update({ where: { id }, data: { status: input.status } });
}
