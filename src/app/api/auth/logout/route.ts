import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, SESSION_COOKIE, tokenHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute } from "@/lib/route";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (token) await prisma.session.deleteMany({ where: { tokenHash: tokenHash(token) } });
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
  });
}
