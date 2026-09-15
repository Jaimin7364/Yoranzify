import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { ApiError } from "@/lib/api-error";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { captureVerifiedPayment, razorpayMockEnabled } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); if (!razorpayMockEnabled()) throw new ApiError(404, "NOT_FOUND", "Not found."); const { gatewayOrderId } = z.object({ gatewayOrderId: z.string().startsWith("order_mock_") }).parse(await parseJson(request)); const payment = await prisma.payment.findUnique({ where: { gatewayOrderId }, include: { order: true } }); if (!payment || payment.order.userId !== user.id) throw new ApiError(404, "PAYMENT_NOT_FOUND", "Payment not found."); return jsonOk({ order: await captureVerifiedPayment(gatewayOrderId, `pay_mock_${Date.now()}`, payment.amountPaise) }); }); }
