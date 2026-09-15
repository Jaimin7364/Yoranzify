import { NextRequest } from "next/server";
import { reorderCategoriesSchema } from "@/lib/categories";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) { return handleRoute(async () => {
  assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const input = reorderCategoriesSchema.parse(await parseJson(request));
  if (new Set(input.orderedIds).size !== input.orderedIds.length) throw new ApiError(400, "DUPLICATE_CATEGORY", "Each category can appear only once.");
  const matching = await prisma.category.count({ where: { id: { in: input.orderedIds }, parentId: input.parentId, archivedAt: null } });
  if (matching !== input.orderedIds.length) throw new ApiError(400, "INVALID_REORDER", "All categories must belong to the selected level.");
  await prisma.$transaction(input.orderedIds.map((id, displayOrder) => prisma.category.update({ where: { id }, data: { displayOrder } })));
  return jsonOk({ success: true });
}); }
