import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, parseJson } from "@/lib/route";
import { moveWishlistItemToCart, wishlistSnapshot } from "@/lib/wishlist";
const schema = z.object({ variantId: z.number().int().positive().nullable().optional() });
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); const input = schema.parse(await parseJson(request)); await moveWishlistItemToCart(user.id, Number((await params).id), input.variantId); return NextResponse.json(await wishlistSnapshot(user.id)); }); }
