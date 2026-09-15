import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { verifyCheckoutPayment } from "@/lib/payments";
const schema = z.object({ razorpay_order_id: z.string().min(5).max(80), razorpay_payment_id: z.string().min(5).max(80), razorpay_signature: z.string().length(64) });
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); return jsonOk({ order: await verifyCheckoutPayment(user.id, schema.parse(await parseJson(request))) }); }); }
