import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleRoute, jsonOk } from "@/lib/route";
export async function GET(request: NextRequest) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); const [categories, colors, sizes] = await Promise.all([prisma.category.findMany({ where: { archivedAt: null }, select: { id: true, name: true, parentId: true }, orderBy: { name: "asc" } }), prisma.color.findMany({ orderBy: { name: "asc" } }), prisma.size.findMany({ orderBy: { displayOrder: "asc" } })]); return jsonOk({ categories, colors, sizes }); }); }
