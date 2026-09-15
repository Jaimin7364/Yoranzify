import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { saveCoupon, savePromotion } from "@/lib/promotions";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-error";

const paramsSchema = z.object({ kind: z.enum(["coupon", "promotion"]), id: z.coerce.number().int().positive() });
export async function PATCH(request: NextRequest, context: { params: Promise<{ kind: string; id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const { kind, id } = paramsSchema.parse(await context.params); const offer = kind === "coupon" ? await saveCoupon(await parseJson(request), id) : await savePromotion(await parseJson(request), id); return jsonOk({ offer }); }); }
export async function DELETE(request: NextRequest, context: { params: Promise<{ kind: string; id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const { kind, id } = paramsSchema.parse(await context.params); if (kind === "coupon") { const coupon = await prisma.coupon.findUnique({ where: { id }, include: { _count: { select: { usages: true } } } }); if (!coupon) throw new ApiError(404, "OFFER_NOT_FOUND", "Offer not found."); if (coupon._count.usages) await prisma.coupon.update({ where: { id }, data: { enabled: false } }); else await prisma.coupon.delete({ where: { id } }); } else await prisma.promotion.delete({ where: { id } }); return jsonOk({ deleted: true }); }); }
