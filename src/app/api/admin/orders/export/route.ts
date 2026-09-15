import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminOrderWhere, ordersCsv } from "@/lib/admin-operations";
import { handleRoute } from "@/lib/route";
export async function GET(request: NextRequest) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); const rows = await prisma.order.findMany({ where: adminOrderWhere(request.nextUrl.searchParams), include: { user: true }, orderBy: { createdAt: "desc" }, take: 5000 }); return new Response(ordersCsv(rows.map((order) => ({ orderNumber: order.orderNumber, customer: order.user.name, email: order.user.email, status: order.status, totalPaise: order.totalPaise, createdAt: order.createdAt }))), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="yoranzify-orders.csv"` } }); }); }
