import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { adjustInventory } from "@/lib/products";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { ApiError } from "@/lib/api-error";
const inputSchema = z.object({ delta: z.number().int(), reason: z.enum(["RESTOCK", "CORRECTION"]), note: z.string().trim().max(500).default("") });
export async function POST(request: NextRequest, { params }: { params: Promise<{ variantId: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestAdmin(await userFromRequest(request)); const parsedId = z.coerce.number().int().positive().safeParse((await params).variantId); if (!parsedId.success) throw new ApiError(404, "VARIANT_NOT_FOUND", "Variant not found."); const input = inputSchema.parse(await parseJson(request)); return jsonOk({ variant: await adjustInventory(parsedId.data, input.delta, input.reason, input.note, user.id) }); }); }
