import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api-error";
import { handleRoute, jsonOk } from "@/lib/route";
import { processWebhook } from "@/lib/payments";
export async function POST(request: NextRequest) { return handleRoute(async () => { const signature = request.headers.get("x-razorpay-signature"); const eventId = request.headers.get("x-razorpay-event-id"); if (!signature || !eventId) throw new ApiError(400, "WEBHOOK_HEADERS_MISSING", "Required webhook headers are missing."); const rawBody = await request.text(); return jsonOk(await processWebhook(eventId, rawBody, signature)); }); }
