import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { registerSchema } from "@/lib/auth-validation";
import { createSession, hashPassword, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, enforceRateLimit, requestIdentity } from "@/lib/request-security";
import { handleRoute, parseJson } from "@/lib/route";
import { ApiError } from "@/lib/api-error";
import { CART_COOKIE, mergeGuestCart } from "@/lib/cart";
import { clearGuestCartCookie } from "@/lib/cart-request";
import { enqueueEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const input = registerSchema.parse(await parseJson(request));
    await enforceRateLimit("register-ip", requestIdentity(request), 20, 15 * 60_000);
    await enforceRateLimit("register-account", requestIdentity(request, input.email), 4, 15 * 60_000);
    try {
      const passwordHash = await hashPassword(input.password);
      const user = await prisma.$transaction(async (tx) => { const created = await tx.user.create({ data: { name: input.name, email: input.email, mobile: input.mobile, passwordHash } }); await enqueueEmail(tx, `welcome:${created.id}`, created.email, "WELCOME", { name: created.name, url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/account` }); return created; });
      const session = await createSession(user.id);
      await mergeGuestCart(user.id, request.cookies.get(CART_COOKIE)?.value);
      const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, role: user.role } }, { status: 201 });
      setSessionCookie(response, session.token, session.expiresAt);
      clearGuestCartCookie(response);
      return response;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ApiError(409, "ACCOUNT_EXISTS", "An account with these details already exists.");
      throw error;
    }
  });
}
