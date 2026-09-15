import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { couponInclude, promotionInclude, saveCoupon, savePromotion } from "@/lib/promotions";
import { z } from "zod";

export async function GET(request: NextRequest) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); const [coupons, promotions] = await Promise.all([prisma.coupon.findMany({ include: couponInclude, orderBy: { createdAt: "desc" } }), prisma.promotion.findMany({ include: promotionInclude, orderBy: { createdAt: "desc" } })]); return jsonOk({ coupons, promotions }); }); }
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const body = z.object({ kind: z.enum(["coupon", "promotion"]), data: z.unknown() }).parse(await parseJson(request)); const offer = body.kind === "coupon" ? await saveCoupon(body.data) : await savePromotion(body.data); return jsonOk({ offer }, 201); }); }
