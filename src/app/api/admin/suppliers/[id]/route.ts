import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { saveSupplier } from "@/lib/suppliers";
import { ApiError } from "@/lib/api-error";

async function idOf(params: Promise<{ id: string }>) { const result = z.coerce.number().int().positive().safeParse((await params).id); if (!result.success) throw new ApiError(404, "SUPPLIER_NOT_FOUND", "Supplier not found."); return result.data; }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); return jsonOk({ supplier: await saveSupplier(await parseJson(request), await idOf(params)) }); }); }
