import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk } from "@/lib/route";
import { ApiError } from "@/lib/api-error";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const parsed = z.coerce.number().int().positive().safeParse((await params).id); if (!parsed.success) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found."); await prisma.product.update({ where: { id: parsed.data }, data: { archivedAt: null, status: "DRAFT" } }); return jsonOk({ success: true }); }); }
