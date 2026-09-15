import { z } from "zod";
import { prisma } from "./prisma";
import { ApiError } from "./api-error";

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters").max(100),
  slug: z.string().trim().max(120).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  parentId: z.number().int().positive().nullable().default(null),
  imageMediaId: z.number().int().positive().nullable().default(null),
  displayOrder: z.number().int().min(0).max(100000).default(0),
  isVisible: z.boolean().default(true)
});

export const reorderCategoriesSchema = z.object({ parentId: z.number().int().positive().nullable(), orderedIds: z.array(z.number().int().positive()).min(1) });

export function slugifyCategory(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}

export type CategoryView = { id: number; name: string; slug: string; description: string | null; parentId: number | null; imageMediaId: number | null; imageUrl: string | null; displayOrder: number; isVisible: boolean; archivedAt: string | null; children: CategoryView[] };

type CategoryRow = { id: number; name: string; slug: string; description: string | null; parentId: number | null; imageMediaId: number | null; displayOrder: number; isVisible: boolean; archivedAt: Date | null };

export function buildCategoryTree(rows: CategoryRow[]): CategoryView[] {
  const nodes = new Map<number, CategoryView>();
  for (const row of rows) nodes.set(row.id, { ...row, imageUrl: row.imageMediaId ? `/api/media/${row.imageMediaId}` : null, archivedAt: row.archivedAt?.toISOString() ?? null, children: [] });
  const roots: CategoryView[] = [];
  for (const node of nodes.values()) { const parent = node.parentId ? nodes.get(node.parentId) : null; if (parent) parent.children.push(node); else roots.push(node); }
  const sort = (items: CategoryView[]) => items.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)).forEach((item) => sort(item.children));
  sort(roots); return roots;
}

export function filterPublicCategoryTree(items: CategoryView[]): CategoryView[] {
  return items.filter((item) => item.isVisible && !item.archivedAt).map((item) => ({ ...item, children: filterPublicCategoryTree(item.children) }));
}

export async function uniqueCategorySlug(source: string, excludeId?: number) {
  const base = slugifyCategory(source);
  if (!base) throw new ApiError(400, "INVALID_SLUG", "Enter a name that can form a URL.");
  let candidate = base; let suffix = 2;
  while (await prisma.category.findFirst({ where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })) candidate = `${base.slice(0, 115)}-${suffix++}`;
  return candidate;
}

export async function validateCategoryRelations(categoryId: number | null, parentId: number | null, imageMediaId: number | null) {
  if (parentId) {
    if (parentId === categoryId) throw new ApiError(400, "CATEGORY_CYCLE", "A category cannot be its own parent.");
    let cursor: number | null = parentId;
    while (cursor) {
      const parent: { id: number; parentId: number | null; archivedAt: Date | null } | null = await prisma.category.findUnique({ where: { id: cursor }, select: { id: true, parentId: true, archivedAt: true } });
      if (!parent || parent.archivedAt) throw new ApiError(400, "INVALID_PARENT", "Choose an active parent category.");
      if (parent.id === categoryId) throw new ApiError(400, "CATEGORY_CYCLE", "This parent would create a circular category tree.");
      cursor = parent.parentId;
    }
  }
  if (imageMediaId) {
    const media = await prisma.mediaAsset.findUnique({ where: { id: imageMediaId }, select: { kind: true } });
    if (!media || media.kind !== "CATEGORY") throw new ApiError(400, "INVALID_CATEGORY_IMAGE", "Choose an image uploaded for a category.");
  }
}

export async function getCategoryTree(publicOnly = false) {
  const rows = await prisma.category.findMany({ where: publicOnly ? { archivedAt: null } : {}, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });
  const tree = buildCategoryTree(rows);
  if (!publicOnly) return tree;
  return filterPublicCategoryTree(tree);
}

export async function isCategoryPublic(category: { parentId: number | null; isVisible: boolean; archivedAt: Date | null }) {
  if (!category.isVisible || category.archivedAt) return false;
  let parentId = category.parentId;
  while (parentId) {
    const parent: { parentId: number | null; isVisible: boolean; archivedAt: Date | null } | null = await prisma.category.findUnique({ where: { id: parentId }, select: { parentId: true, isVisible: true, archivedAt: true } });
    if (!parent || !parent.isVisible || parent.archivedAt) return false;
    parentId = parent.parentId;
  }
  return true;
}
