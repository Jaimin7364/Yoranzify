import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cartSnapshot, removeCartItem, updateCartItem } from "@/lib/cart";
import { cartIdentityFromRequest } from "@/lib/cart-request";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, parseJson } from "@/lib/route";
import { prisma } from "@/lib/prisma";
const updateSchema = z.object({ quantity: z.number().int().positive() });
async function snapshot(identity: { userId?: number; guestToken?: string | null }) { const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } }); return cartSnapshot(identity, settings?.shippingChargePaise, settings?.freeShippingAbovePaise); }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const input = updateSchema.parse(await parseJson(request)); const { identity } = await cartIdentityFromRequest(request); await updateCartItem(identity, Number((await params).id), input.quantity); return NextResponse.json(await snapshot(identity)); }); }
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const { identity } = await cartIdentityFromRequest(request); await removeCartItem(identity, Number((await params).id)); return NextResponse.json(await snapshot(identity)); }); }
