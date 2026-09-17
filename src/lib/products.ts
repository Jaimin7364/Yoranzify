import { z } from "zod";
import { prisma } from "./prisma";
import { ApiError } from "./api-error";
import { slugifyCategory } from "./categories";

const variantSchema = z.object({
  id: z.number().int().positive().optional(), colorName: z.string().trim().min(1).max(60), colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  sizeName: z.string().trim().min(1).max(30), sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, "Use uppercase letters, numbers, and hyphens"),
  priceOverrideRupees: z.number().min(0).nullable().default(null), stockQuantity: z.number().int().min(0).max(1_000_000), lowStockThreshold: z.number().int().min(0).max(10000).nullable().default(null), weightGrams: z.number().int().positive().max(100000).nullable().default(null), isActive: z.boolean().default(true)
});
const imageSchema = z.object({ mediaId: z.number().int().positive(), altText: z.string().trim().min(1).max(255), position: z.number().int().min(0) });

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(180), slug: z.string().trim().max(200).optional().default(""), skuReference: z.string().trim().toUpperCase().regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/).max(80),
  shortDescription: z.string().trim().max(500).optional().default(""), description: z.string().trim().max(10000).optional().default(""), categoryId: z.number().int().positive(), supplierId: z.number().int().positive().nullable().default(null), brand: z.string().trim().max(100).optional().default(""),
  gender: z.enum(["WOMEN", "MEN", "UNISEX", "KIDS"]), regularPriceRupees: z.number().positive().max(10_000_000), salePriceRupees: z.number().positive().max(10_000_000).nullable().default(null), gstPercent: z.number().min(0).max(100), hsnCode: z.string().trim().regex(/^\d{4,8}$/, "HSN must contain 4–8 digits").or(z.literal("")),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]), isFeatured: z.boolean(), isBestSeller: z.boolean(), isNewArrival: z.boolean(), seoTitle: z.string().trim().max(180).optional().default(""), seoDescription: z.string().trim().max(320).optional().default(""),
  images: z.array(imageSchema).max(12), variants: z.array(variantSchema).min(1, "Add at least one variant").max(200)
}).superRefine((data, ctx) => {
  if (data.salePriceRupees !== null && data.salePriceRupees >= data.regularPriceRupees) ctx.addIssue({ code: "custom", path: ["salePriceRupees"], message: "Sale price must be lower than regular price" });
  if (new Set(data.variants.map((v) => v.sku)).size !== data.variants.length) ctx.addIssue({ code: "custom", path: ["variants"], message: "Variant SKUs must be unique" });
  if (new Set(data.variants.map((v) => `${v.colorName.toLowerCase()}|${v.sizeName.toLowerCase()}`)).size !== data.variants.length) ctx.addIssue({ code: "custom", path: ["variants"], message: "Each colour and size combination must be unique" });
  if (new Set(data.images.map((i) => i.position)).size !== data.images.length) ctx.addIssue({ code: "custom", path: ["images"], message: "Image positions must be unique" });
});

export function calculateDiscountPercent(regularPaise: number, salePaise: number | null) { return salePaise && salePaise < regularPaise ? Math.round((1 - salePaise / regularPaise) * 100) : 0; }
export function effectivePrice(regularPaise: number, salePaise: number | null, overridePaise: number | null) { return overridePaise ?? salePaise ?? regularPaise; }

export async function uniqueProductSlug(source: string, excludeId?: number) { const base = slugifyCategory(source); if (!base) throw new ApiError(400, "INVALID_SLUG", "Enter a product name that can form a URL."); let value = base, suffix = 2; while (await prisma.product.findFirst({ where: { slug: value, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } })) value = `${base.slice(0, 194)}-${suffix++}`; return value; }

export const productInclude = { category: true, supplier: true, images: { include: { media: true }, orderBy: { position: "asc" as const } }, variants: { include: { color: true, size: true }, orderBy: [{ color: { name: "asc" as const } }, { size: { displayOrder: "asc" as const } }] } };

export async function saveProduct(raw: unknown, productId?: number) {
  const input = productInputSchema.parse(raw);
  const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
  if (!category || category.archivedAt) throw new ApiError(400, "INVALID_CATEGORY", "Choose an active category.");
  if (input.supplierId && !await prisma.supplier.findFirst({ where: { id: input.supplierId, isActive: true } })) throw new ApiError(400, "INVALID_SUPPLIER", "Choose an active supplier.");
  if (input.images.length) { const count = await prisma.mediaAsset.count({ where: { id: { in: input.images.map((i) => i.mediaId) }, kind: "PRODUCT" } }); if (count !== new Set(input.images.map((i) => i.mediaId)).size) throw new ApiError(400, "INVALID_PRODUCT_IMAGE", "One or more product images are invalid."); }
  const slug = await uniqueProductSlug(input.slug || input.name, productId);
  return prisma.$transaction(async (tx) => {
    const data = { name: input.name, slug, skuReference: input.skuReference, shortDescription: input.shortDescription || null, description: input.description || null, categoryId: input.categoryId, supplierId: input.supplierId, brand: input.brand || null, gender: input.gender, regularPricePaise: Math.round(input.regularPriceRupees * 100), salePricePaise: input.salePriceRupees === null ? null : Math.round(input.salePriceRupees * 100), gstPercent: input.gstPercent, hsnCode: input.hsnCode || null, status: input.status, isFeatured: input.isFeatured, isBestSeller: input.isBestSeller, isNewArrival: input.isNewArrival, seoTitle: input.seoTitle || null, seoDescription: input.seoDescription || null };
    const product = productId ? await tx.product.update({ where: { id: productId }, data }) : await tx.product.create({ data });
    if (productId) await tx.productImage.deleteMany({ where: { productId } });
    if (input.images.length) await tx.productImage.createMany({ data: input.images.map((image) => ({ ...image, productId: product.id })) });
    const kept: number[] = [];
    for (const variant of input.variants) {
      const color = await tx.color.upsert({ where: { name: variant.colorName }, update: { hex: variant.colorHex.toUpperCase() }, create: { name: variant.colorName, hex: variant.colorHex.toUpperCase() } });
      const size = await tx.size.upsert({ where: { name: variant.sizeName }, update: {}, create: { name: variant.sizeName, displayOrder: 100 } });
      const variantData = { colorId: color.id, sizeId: size.id, sku: variant.sku, priceOverridePaise: variant.priceOverrideRupees === null ? null : Math.round(variant.priceOverrideRupees * 100), lowStockThreshold: variant.lowStockThreshold, weightGrams: variant.weightGrams, isActive: variant.isActive };
      if (variant.id) {
        const existing = await tx.productVariant.findFirst({ where: { id: variant.id, productId: product.id } }); if (!existing) throw new ApiError(400, "INVALID_VARIANT", "A variant no longer exists.");
        const updated = await tx.productVariant.update({ where: { id: variant.id }, data: variantData }); kept.push(updated.id);
        const delta = variant.stockQuantity - existing.stockQuantity; if (delta) await tx.productVariant.update({ where: { id: updated.id }, data: { stockQuantity: variant.stockQuantity } }).then(() => tx.inventoryMovement.create({ data: { variantId: updated.id, delta, balance: variant.stockQuantity, reason: "CORRECTION", note: "Stock changed in product editor" } }));
      } else {
        const created = await tx.productVariant.create({ data: { ...variantData, productId: product.id, stockQuantity: variant.stockQuantity } }); kept.push(created.id);
        if (variant.stockQuantity) await tx.inventoryMovement.create({ data: { variantId: created.id, delta: variant.stockQuantity, balance: variant.stockQuantity, reason: "INITIAL", note: "Initial product stock" } });
      }
    }
    if (productId) await tx.productVariant.updateMany({ where: { productId, id: { notIn: kept } }, data: { isActive: false } });
    return tx.product.findUniqueOrThrow({ where: { id: product.id }, include: productInclude });
  });
}

export async function adjustInventory(variantId: number, delta: number, reason: "RESTOCK" | "CORRECTION", note: string, actorId: number) {
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 1_000_000) throw new ApiError(400, "INVALID_ADJUSTMENT", "Enter a non-zero whole-number adjustment.");
  return prisma.$transaction(async (tx) => { const updated = await tx.productVariant.updateMany({ where: { id: variantId, ...(delta < 0 ? { stockQuantity: { gte: -delta } } : {}) }, data: { stockQuantity: { increment: delta } } }); if (updated.count !== 1) throw new ApiError(409, "INSUFFICIENT_STOCK", "This adjustment would make stock negative."); const variant = await tx.productVariant.findUniqueOrThrow({ where: { id: variantId } }); await tx.inventoryMovement.create({ data: { variantId, delta, balance: variant.stockQuantity, reason, note: note.slice(0, 500) || null, actorId } }); return variant; });
}

export function presentProduct<T extends { regularPricePaise: number; salePricePaise: number | null; images: { media: { id: number } }[] }>(product: T) { return { ...product, regularPriceRupees: product.regularPricePaise / 100, salePriceRupees: product.salePricePaise === null ? null : product.salePricePaise / 100, discountPercent: calculateDiscountPercent(product.regularPricePaise, product.salePricePaise), images: product.images.map((image) => ({ ...image, url: `/api/media/${image.media.id}` })) }; }
