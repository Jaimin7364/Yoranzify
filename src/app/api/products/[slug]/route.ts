import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-error";
import { handleRoute, jsonOk } from "@/lib/route";
import { presentProduct, productInclude } from "@/lib/products";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) { return handleRoute(async () => { const product = await prisma.product.findFirst({ where: { slug: (await params).slug, status: "ACTIVE", archivedAt: null, category: { archivedAt: null, isVisible: true } }, include: productInclude }); if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found."); return jsonOk({ product: presentProduct(product) }); }); }
