import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth-validation";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, enforceRateLimit, requestIdentity } from "@/lib/request-security";
import { handleRoute, parseJson } from "@/lib/route";
import { ApiError } from "@/lib/api-error";
import { CART_COOKIE, mergeGuestCart } from "@/lib/cart";
import { clearGuestCartCookie } from "@/lib/cart-request";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const input = loginSchema.parse(await parseJson(request));
    await enforceRateLimit("login", requestIdentity(request, input.email), 12, 15 * 60_000);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.isActive || !(await verifyPassword(input.password, user.passwordHash))) throw new ApiError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    const session = await createSession(user.id);
    await mergeGuestCart(user.id, request.cookies.get(CART_COOKIE)?.value);
    const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, role: user.role } });
    setSessionCookie(response, session.token, session.expiresAt);
    clearGuestCartCookie(response);
    return response;
  });
}
