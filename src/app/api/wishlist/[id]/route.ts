import { NextRequest, NextResponse } from "next/server";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute } from "@/lib/route";
import { removeWishlistItem, wishlistSnapshot } from "@/lib/wishlist";
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); await removeWishlistItem(user.id, Number((await params).id)); return NextResponse.json(await wishlistSnapshot(user.id)); }); }
