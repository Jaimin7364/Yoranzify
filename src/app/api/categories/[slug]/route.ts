import { handleRoute, jsonOk } from "@/lib/route";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-error";
import { isCategoryPublic } from "@/lib/categories";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) { return handleRoute(async () => { const { slug } = await params; const category = await prisma.category.findUnique({ where: { slug }, include: { children: { where: { isVisible: true, archivedAt: null }, orderBy: { displayOrder: "asc" } } } }); if (!category || !(await isCategoryPublic(category))) throw new ApiError(404, "CATEGORY_NOT_FOUND", "Category not found."); return jsonOk({ category }); }); }
