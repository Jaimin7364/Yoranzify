import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./prisma";
import { effectivePrice } from "./products";

export const CATALOGUE_PAGE_SIZE = 12;
const sortValues = ["newest", "price-asc", "price-desc", "popular"] as const;
const collectionValues = ["featured", "new", "bestsellers", "sale"] as const;

export type CatalogueParams = {
  q: string; category: string; gender: string; availability: string; sizes: string[];
  colors: string[]; brand: string; minPrice: number | null; maxPrice: number | null;
  sort: typeof sortValues[number]; collection: typeof collectionValues[number] | ""; page: number;
};

function one(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function many(value: string | string[] | undefined) { return (Array.isArray(value) ? value : value ? value.split(",") : []).map((item) => item.trim()).filter(Boolean).slice(0, 20); }
function money(value: string | undefined) { if (!value) return null; const parsed = Number(value); return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : null; }

export function parseCatalogueParams(raw: Record<string, string | string[] | undefined>): CatalogueParams {
  const sort = z.enum(sortValues).catch("newest").parse(one(raw.sort));
  const collection = z.enum(collectionValues).or(z.literal("")).catch("").parse(one(raw.collection) ?? "");
  const gender = z.enum(["WOMEN", "MEN", "UNISEX", "KIDS", ""]).catch("").parse((one(raw.gender) ?? "").toUpperCase());
  const availability = z.enum(["in-stock", "", "all"]).catch("").parse(one(raw.availability) ?? "");
  const page = Math.max(1, Math.min(1000, Number.parseInt(one(raw.page) ?? "1", 10) || 1));
  return { q: (one(raw.q) ?? "").trim().replace(/\s+/g, " ").slice(0, 100), category: (one(raw.category) ?? "").trim().slice(0, 120), gender, availability, sizes: many(raw.size), colors: many(raw.color), brand: (one(raw.brand) ?? "").trim().slice(0, 100), minPrice: money(one(raw.minPrice)), maxPrice: money(one(raw.maxPrice)), sort, collection, page };
}

export function canonicalCatalogueQuery(params: CatalogueParams) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q); if (params.category) query.set("category", params.category);
  if (params.gender) query.set("gender", params.gender.toLowerCase()); if (params.availability === "in-stock") query.set("availability", "in-stock");
  [...params.sizes].sort().forEach((value) => query.append("size", value)); [...params.colors].sort().forEach((value) => query.append("color", value));
  if (params.brand) query.set("brand", params.brand); if (params.minPrice !== null) query.set("minPrice", String(params.minPrice / 100)); if (params.maxPrice !== null) query.set("maxPrice", String(params.maxPrice / 100));
  if (params.collection) query.set("collection", params.collection); if (params.sort !== "newest") query.set("sort", params.sort); if (params.page > 1) query.set("page", String(params.page));
  return query.toString();
}

export const catalogueProductInclude = { category: true, images: { include: { media: true }, orderBy: { position: "asc" as const }, take: 1 }, variants: { where: { isActive: true }, include: { color: true, size: true } } };
type CatalogueProduct = Prisma.ProductGetPayload<{ include: typeof catalogueProductInclude }>;

export function lowestEffectivePrice(product: CatalogueProduct) {
  const base = effectivePrice(product.regularPricePaise, product.salePricePaise, null);
  return product.variants.reduce((lowest, variant) => Math.min(lowest, effectivePrice(product.regularPricePaise, product.salePricePaise, variant.priceOverridePaise)), base);
}

export async function queryCatalogue(params: CatalogueParams) {
  const tokens = params.q.toLowerCase().split(" ").filter(Boolean);
  const where: Prisma.ProductWhereInput = { status: "ACTIVE", archivedAt: null, category: { archivedAt: null, isVisible: true },
    ...(params.category ? { category: { slug: params.category, archivedAt: null, isVisible: true } } : {}), ...(params.gender ? { gender: params.gender as "WOMEN" | "MEN" | "UNISEX" | "KIDS" } : {}),
    ...(params.brand ? { brand: params.brand } : {}), ...(params.collection === "featured" ? { isFeatured: true } : {}), ...(params.collection === "new" ? { isNewArrival: true } : {}), ...(params.collection === "bestsellers" ? { isBestSeller: true } : {}), ...(params.collection === "sale" ? { salePricePaise: { not: null } } : {}),
    ...(params.sizes.length || params.colors.length || params.availability === "in-stock" ? { variants: { some: { isActive: true, ...(params.sizes.length ? { size: { name: { in: params.sizes } } } : {}), ...(params.colors.length ? { color: { name: { in: params.colors } } } : {}), ...(params.availability === "in-stock" ? { stockQuantity: { gt: 0 } } : {}) } } } : {}) };
  let products = await prisma.product.findMany({ where, include: catalogueProductInclude });
  if (tokens.length) products = products.filter((product) => { const haystack = [product.name, product.skuReference, product.category.name, product.brand, ...product.variants.map((variant) => variant.sku)].filter(Boolean).join(" ").toLowerCase(); return tokens.every((token) => haystack.includes(token)); });
  products = products.filter((product) => { const price = lowestEffectivePrice(product); return (params.minPrice === null || price >= params.minPrice) && (params.maxPrice === null || price <= params.maxPrice); });
  products.sort((a, b) => params.sort === "price-asc" ? lowestEffectivePrice(a) - lowestEffectivePrice(b) || a.id - b.id : params.sort === "price-desc" ? lowestEffectivePrice(b) - lowestEffectivePrice(a) || a.id - b.id : params.sort === "popular" ? b.deliveredSalesCount - a.deliveredSalesCount || b.id - a.id : b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id);
  const total = products.length; const pages = Math.max(1, Math.ceil(total / CATALOGUE_PAGE_SIZE)); const page = Math.min(params.page, pages);
  return { products: products.slice((page - 1) * CATALOGUE_PAGE_SIZE, page * CATALOGUE_PAGE_SIZE), total, page, pages };
}

export async function getCatalogueFacets() {
  const [categories, colors, sizes, brandRows] = await Promise.all([
    prisma.category.findMany({ where: { archivedAt: null, isVisible: true }, select: { name: true, slug: true }, orderBy: { name: "asc" } }), prisma.color.findMany({ orderBy: { name: "asc" } }), prisma.size.findMany({ orderBy: { displayOrder: "asc" } }), prisma.product.findMany({ where: { status: "ACTIVE", archivedAt: null, brand: { not: null } }, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } })
  ]); return { categories, colors, sizes, brands: brandRows.flatMap((row) => row.brand ? [row.brand] : []) };
}
