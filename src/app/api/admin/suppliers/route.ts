import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { saveSupplier } from "@/lib/suppliers";

export async function GET(request: NextRequest) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); return jsonOk({ suppliers: await prisma.supplier.findMany({ orderBy: { name: "asc" } }) }); }); }
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); return jsonOk({ supplier: await saveSupplier(await parseJson(request)) }, 201); }); }
