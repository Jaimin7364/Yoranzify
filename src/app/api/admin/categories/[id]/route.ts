import { NextRequest } from "next/server";
import { z } from "zod";
import { categoryInputSchema, uniqueCategorySlug, validateCategoryRelations } from "@/lib/categories";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-error";

async function categoryId(params: Promise<{ id: string }>) { const parsed = z.coerce.number().int().positive().safeParse((await params).id); if (!parsed.success) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Category not found."); return parsed.data; }

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const id = await categoryId(params);
    const existing = await prisma.category.findUnique({ where: { id } }); if (!existing || existing.archivedAt) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Category not found.");
    const input = categoryInputSchema.parse(await parseJson(request)); await validateCategoryRelations(id, input.parentId, input.imageMediaId);
    const slug = await uniqueCategorySlug(input.slug || input.name, id);
    const { shippingChargeRupees, freeShippingAboveRupees, ...categoryInput } = input;
    const category = await prisma.category.update({ where: { id }, data: { ...categoryInput, shippingChargePaise: shippingChargeRupees === null ? null : Math.round(shippingChargeRupees * 100), freeShippingAbovePaise: freeShippingAboveRupees === null ? null : Math.round(freeShippingAboveRupees * 100), slug, description: input.description || null } });
    return jsonOk({ category });
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleRoute(async () => {
    assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const id = await categoryId(params);
    const category = await prisma.category.findUnique({ where: { id }, include: { children: { where: { archivedAt: null }, select: { id: true } } } });
    if (!category || category.archivedAt) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Category not found.");
    if (category.children.length) throw new ApiError(409, "CATEGORY_HAS_CHILDREN", "Archive or move child categories first.");
    await prisma.category.update({ where: { id }, data: { archivedAt: new Date(), isVisible: false } });
    return jsonOk({ success: true });
  });
}
