import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleRoute, jsonOk } from "@/lib/route";
export async function GET(request: NextRequest) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); const q = request.nextUrl.searchParams.get("q")?.trim(); return jsonOk({ customers: await prisma.user.findMany({ where: { role: "CUSTOMER", ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { mobile: { contains: q } }] } : {}) }, include: { orders: { where: { paymentStatus: "PAID", status: { not: "CANCELLED" } }, select: { totalPaise: true, createdAt: true }, orderBy: { createdAt: "desc" } } }, orderBy: { createdAt: "desc" }, take: 100 }) }); }); }
