import { NextRequest } from "next/server";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { handleRoute, jsonOk } from "@/lib/route";
import { prisma } from "@/lib/prisma";
export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) { return handleRoute(async () => { const user = requireRequestUser(await userFromRequest(request)); const order = await prisma.order.findFirst({ where: { id: Number((await params).orderId), userId: user.id }, include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } } }); if (!order) throw new ApiError(404, "ORDER_NOT_FOUND", "Order not found."); return jsonOk({ orderId: order.id, orderStatus: order.status, paymentStatus: order.paymentStatus, attempt: order.payments[0] ? { status: order.payments[0].status, failureDescription: order.payments[0].failureDescription, expiresAt: order.payments[0].expiresAt } : null }); }); }
