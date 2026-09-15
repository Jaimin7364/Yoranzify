import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { saveBanner } from "@/lib/homepage-cms";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";

const idSchema = z.coerce.number().int().positive();
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const id = idSchema.parse((await context.params).id); return jsonOk({ banner: await saveBanner(await parseJson(request), id) }); }); }
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const id = idSchema.parse((await context.params).id); await prisma.banner.delete({ where: { id } }); return jsonOk({ deleted: true }); }); }
