import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-error";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { updateOrderOperations } from "@/lib/admin-operations";
import { orderInclude } from "@/lib/orders";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); const order = await prisma.order.findUnique({ where: { id: Number((await params).id) }, include: { ...orderInclude, user: { select: { id: true, name: true, email: true, mobile: true } }, reservations: true } }); if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found."); return jsonOk({ order }); }); }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const admin = requireRequestAdmin(await userFromRequest(request)); return jsonOk({ order: await updateOrderOperations(admin.id, Number((await params).id), await parseJson(request)) }); }); }
