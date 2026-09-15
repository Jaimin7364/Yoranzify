import { prisma } from "./prisma";
import { ApiError } from "./api-error";
import { addCartItem } from "./cart";
import { effectivePrice } from "./products";

const wishlistInclude = { items: { include: { product: { include: { category: true, images: { include: { media: true }, orderBy: { position: "asc" as const }, take: 1 }, variants: { where: { isActive: true }, include: { color: true, size: true }, orderBy: [{ color: { name: "asc" as const } }, { size: { displayOrder: "asc" as const } }] } } }, variant: { include: { color: true, size: true } } }, orderBy: { createdAt: "desc" as const } } };

export async function wishlistSnapshot(userId: number) {
  const wishlist = await prisma.wishlist.findUnique({ where: { userId }, include: wishlistInclude });
  if (!wishlist) return { id: null, items: [], count: 0 };
  const items = wishlist.items.map((item) => { const productAvailable = item.product.status === "ACTIVE" && !item.product.archivedAt && item.product.category.isVisible && !item.product.category.archivedAt; const variant = item.variant; const variantAvailable = !variant || (variant.isActive && variant.stockQuantity > 0); const suggestedVariant = item.product.variants.find((entry) => entry.stockQuantity > 0) ?? null; const chosen = variant ?? suggestedVariant; return { id: item.id, productId: item.productId, variantId: item.variantId, available: productAvailable && variantAvailable, canMoveToCart: productAvailable && Boolean(chosen?.stockQuantity), moveVariantId: chosen?.id ?? null, product: { name: item.product.name, slug: item.product.slug, category: item.product.category.name, imageUrl: item.product.images[0] ? `/api/media/${item.product.images[0].media.id}` : null, pricePaise: chosen ? effectivePrice(item.product.regularPricePaise, item.product.salePricePaise, chosen.priceOverridePaise) : effectivePrice(item.product.regularPricePaise, item.product.salePricePaise, null) }, variant: variant ? { sku: variant.sku, color: variant.color.name, size: variant.size.name, stockQuantity: variant.stockQuantity } : null }; });
  return { id: wishlist.id, items, count: items.length };
}

export async function addWishlistItem(userId: number, productId: number, variantId?: number | null) {
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { category: true } }); if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found.");
  if (variantId) { const variant = await prisma.productVariant.findFirst({ where: { id: variantId, productId } }); if (!variant) throw new ApiError(400, "INVALID_VARIANT", "That option does not belong to this product."); }
  const wishlist = await prisma.wishlist.upsert({ where: { userId }, update: {}, create: { userId } });
  const existing = await prisma.wishlistItem.findFirst({ where: { wishlistId: wishlist.id, productId, variantId: variantId ?? null } });
  if (existing) return existing;
  return prisma.wishlistItem.create({ data: { wishlistId: wishlist.id, productId, variantId: variantId ?? null } });
}
export async function removeWishlistItem(userId: number, itemId: number) { const item = await prisma.wishlistItem.findFirst({ where: { id: itemId, wishlist: { userId } } }); if (!item) throw new ApiError(404, "WISHLIST_ITEM_NOT_FOUND", "Saved item not found."); await prisma.wishlistItem.delete({ where: { id: itemId } }); }
export async function moveWishlistItemToCart(userId: number, itemId: number, requestedVariantId?: number | null) { const item = await prisma.wishlistItem.findFirst({ where: { id: itemId, wishlist: { userId } }, include: { product: { include: { variants: { where: { isActive: true }, orderBy: { stockQuantity: "desc" } } } } } }); if (!item) throw new ApiError(404, "WISHLIST_ITEM_NOT_FOUND", "Saved item not found."); const variantId = requestedVariantId ?? item.variantId ?? item.product.variants.find((variant) => variant.stockQuantity > 0)?.id; if (!variantId || !item.product.variants.some((variant) => variant.id === variantId)) throw new ApiError(409, "VARIANT_UNAVAILABLE", "Choose an available option before moving this piece."); await addCartItem({ userId }, variantId, 1); await prisma.wishlistItem.delete({ where: { id: item.id } }); }
