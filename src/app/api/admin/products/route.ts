import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { presentProduct, productInclude, saveProduct } from "@/lib/products";

export async function GET(request: NextRequest) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); const query = request.nextUrl.searchParams.get("q")?.trim(); const status = request.nextUrl.searchParams.get("status"); const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") || 1)); const where = { ...(query ? { OR: [{ name: { contains: query } }, { skuReference: { contains: query } }] } : {}), ...(status && ["DRAFT", "ACTIVE", "INACTIVE"].includes(status) ? { status: status as "DRAFT" | "ACTIVE" | "INACTIVE" } : {}) }; const [products, total] = await prisma.$transaction([prisma.product.findMany({ where, include: productInclude, orderBy: { createdAt: "desc" }, skip: (page - 1) * 20, take: 20 }), prisma.product.count({ where })]); return jsonOk({ products: products.map(presentProduct), pagination: { page, total, pages: Math.ceil(total / 20) } }); }); }
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); return jsonOk({ product: presentProduct(await saveProduct(await parseJson(request))) }, 201); }); }
