import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { moderateReview } from "@/lib/reviews";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const id = z.coerce.number().int().positive().safeParse((await params).id); if (!id.success) throw new ApiError(404, "REVIEW_NOT_FOUND", "Review not found."); return jsonOk({ review: await moderateReview(id.data, await parseJson(request)) }); }); }
