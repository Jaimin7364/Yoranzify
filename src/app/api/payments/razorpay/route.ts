import { NextRequest } from "next/server";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { initiateRazorpayPayment } from "@/lib/payments";
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); return jsonOk({ payment: await initiateRazorpayPayment(user.id, await parseJson(request)) }, 201); }); }
