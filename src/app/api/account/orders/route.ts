import { NextRequest } from "next/server";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleRoute, jsonOk } from "@/lib/route";
export async function GET(request: NextRequest) { return handleRoute(async () => { const user = requireRequestUser(await userFromRequest(request)); return jsonOk({ orders: await prisma.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: "desc" } }) }); }); }
