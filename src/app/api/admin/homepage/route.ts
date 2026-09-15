import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { bannerInclude, ensureHomepageSections, saveBanner, saveSections } from "@/lib/homepage-cms";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { z } from "zod";

async function content() { const [banners, sections] = await Promise.all([prisma.banner.findMany({ include: bannerInclude, orderBy: [{ position: "asc" }, { id: "asc" }] }), ensureHomepageSections()]); return { banners, sections }; }
export async function GET(request: NextRequest) { return handleRoute(async () => { requireRequestAdmin(await userFromRequest(request)); return jsonOk(await content()); }); }
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); requireRequestAdmin(await userFromRequest(request)); const body = z.object({ kind: z.enum(["banner", "sections"]), data: z.unknown() }).parse(await parseJson(request)); if (body.kind === "banner") return jsonOk({ banner: await saveBanner(body.data) }, 201); await saveSections(body.data); return jsonOk(await content()); }); }
