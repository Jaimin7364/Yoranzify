import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk } from "@/lib/route";
import { releaseExpiredPayments } from "@/lib/payments";
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); return jsonOk({ released: await releaseExpiredPayments() }); }); }
