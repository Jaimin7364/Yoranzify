import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { presentProduct, productInclude, saveProduct } from "@/lib/products";
async function idOf(params: Promise<{ id: string }>) { const id = z.coerce.number().int().positive().safeParse((await params).id); if (!id.success) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found."); return id.data; }
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); const product = await prisma.product.findUnique({ where: { id: await idOf(params) }, include: productInclude }); if (!product) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found."); return jsonOk({ product: presentProduct(product) }); }); }
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const id = await idOf(params); if (!await prisma.product.findUnique({ where: { id } })) throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found."); return jsonOk({ product: presentProduct(await saveProduct(await parseJson(request), id)) }); }); }
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const id = await idOf(params); await prisma.product.update({ where: { id }, data: { archivedAt: new Date(), status: "INACTIVE", variants: { updateMany: { where: {}, data: { isActive: false } } } } }); return jsonOk({ success: true }); }); }
