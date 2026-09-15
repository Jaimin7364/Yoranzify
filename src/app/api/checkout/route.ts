import { NextRequest } from "next/server";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { checkoutPreview, createCodOrder } from "@/lib/orders";
export async function GET(request: NextRequest) { return handleRoute(async () => { const user = requireRequestUser(await userFromRequest(request)); return jsonOk({ checkout: await checkoutPreview(user.id) }); }); }
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); return jsonOk({ order: await createCodOrder(user.id, await parseJson(request)) }, 201); }); }
