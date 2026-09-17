import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { prisma } from "@/lib/prisma";
export async function PATCH(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const { platformFeeRupees } = z.object({ platformFeeRupees: z.coerce.number().min(0).max(10000) }).parse(await parseJson(request)); const settings = await prisma.siteSetting.update({ where: { id: 1 }, data: { platformFeePaise: Math.round(platformFeeRupees * 100) } }); return jsonOk({ platformFeeRupees: settings.platformFeePaise / 100 }); }); }
