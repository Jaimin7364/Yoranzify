import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addCartItem, cartSnapshot, clearCart } from "@/lib/cart";
import { cartIdentityFromRequest, setGuestCartCookie } from "@/lib/cart-request";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, parseJson } from "@/lib/route";
import { prisma } from "@/lib/prisma";
const addSchema = z.object({ variantId: z.number().int().positive(), quantity: z.number().int().positive() });
async function snapshot(identity: { userId?: number; guestToken?: string | null }) { const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } }); return cartSnapshot(identity, settings?.shippingChargePaise, settings?.freeShippingAbovePaise); }
export async function GET(request: NextRequest) { return handleRoute(async () => { const { identity } = await cartIdentityFromRequest(request); return NextResponse.json(await snapshot(identity)); }); }
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const input = addSchema.parse(await parseJson(request)); const { identity, newGuestToken } = await cartIdentityFromRequest(request, true); await addCartItem(identity, input.variantId, input.quantity); const response = NextResponse.json(await snapshot(identity), { status: 201 }); setGuestCartCookie(response, newGuestToken); return response; }); }
export async function DELETE(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const { identity } = await cartIdentityFromRequest(request); await clearCart(identity); return NextResponse.json(await snapshot(identity)); }); }
