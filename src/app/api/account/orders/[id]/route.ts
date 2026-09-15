import { NextRequest } from "next/server";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { ApiError } from "@/lib/api-error";
import { cancelOrder, orderInclude } from "@/lib/orders";
import { handleRoute, jsonOk } from "@/lib/route";
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { const user = requireRequestUser(await userFromRequest(request)); const order = await prisma.order.findFirst({ where: { id: Number((await params).id), userId: user.id }, include: orderInclude }); if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found."); return jsonOk({ order }); }); }
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); return jsonOk({ order: await cancelOrder(user.id, Number((await params).id)) }); }); }
