import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { setCustomerActive } from "@/lib/admin-operations";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const admin = requireRequestAdmin(await userFromRequest(request)); return jsonOk({ customer: await setCustomerActive(admin.id, Number((await params).id), await parseJson(request)) }); }); }
