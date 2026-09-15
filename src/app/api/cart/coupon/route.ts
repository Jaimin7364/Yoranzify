import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyCartCoupon, cartSnapshot, removeCartCoupon } from "@/lib/cart";
import { cartIdentityFromRequest } from "@/lib/cart-request";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, parseJson } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-error";

async function snapshot(identity: { userId?: number; guestToken?: string | null }) { const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } }); return cartSnapshot(identity, settings?.shippingChargePaise, settings?.freeShippingAbovePaise); }
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const { code } = z.object({ code: z.string().trim().min(3).max(40) }).parse(await parseJson(request)); const { identity } = await cartIdentityFromRequest(request); await applyCartCoupon(identity, code); const cart = await snapshot(identity); if (!cart.coupon) throw new ApiError(409, cart.couponError?.code ?? "COUPON_NOT_APPLICABLE", cart.couponError?.message ?? "This coupon is not applicable to your current bag."); return NextResponse.json(cart); }); }
export async function DELETE(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const { identity } = await cartIdentityFromRequest(request); await removeCartCoupon(identity); return NextResponse.json(await snapshot(identity)); }); }
