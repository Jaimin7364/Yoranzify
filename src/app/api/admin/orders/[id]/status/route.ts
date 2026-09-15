import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { progressOrder } from "@/lib/admin-operations";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const admin = requireRequestAdmin(await userFromRequest(request)); const { status } = z.object({ status: z.enum(["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]) }).parse(await parseJson(request)); return jsonOk({ order: await progressOrder(admin.id, Number((await params).id), status) }); }); }
