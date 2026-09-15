import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminOrderWhere } from "@/lib/admin-operations";
import { handleRoute, jsonOk } from "@/lib/route";
export async function GET(request: NextRequest) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); return jsonOk({ orders: await prisma.order.findMany({ where: adminOrderWhere(request.nextUrl.searchParams), include: { user: { select: { id: true, name: true, email: true, mobile: true } }, items: true }, orderBy: { createdAt: "desc" }, take: 100 }) }); }); }
