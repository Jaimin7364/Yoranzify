import { NextRequest } from "next/server";
import { categoryInputSchema, getCategoryTree, uniqueCategorySlug, validateCategoryRelations } from "@/lib/categories";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); return jsonOk({ categories: await getCategoryTree() }); }); }

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request));
    const input = categoryInputSchema.parse(await parseJson(request));
    await validateCategoryRelations(null, input.parentId, input.imageMediaId);
    const slug = await uniqueCategorySlug(input.slug || input.name);
    const category = await prisma.category.create({ data: { ...input, slug, description: input.description || null } });
    return jsonOk({ category }, 201);
  });
}
