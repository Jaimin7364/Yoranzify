import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, parseJson } from "@/lib/route";
import { addWishlistItem, wishlistSnapshot } from "@/lib/wishlist";
const schema = z.object({ productId: z.number().int().positive(), variantId: z.number().int().positive().nullable().optional() });
export async function GET(request: NextRequest) { return handleRoute(async () => { const user = await userFromRequest(request); return NextResponse.json(user ? { ...await wishlistSnapshot(user.id), authenticated: true } : { id: null, items: [], count: 0, authenticated: false }); }); }
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); const input = schema.parse(await parseJson(request)); await addWishlistItem(user.id, input.productId, input.variantId); return NextResponse.json(await wishlistSnapshot(user.id), { status: 201 }); }); }
