import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/lib/auth-validation";
import { hashPassword, tokenHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, enforceRateLimit, requestIdentity } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { ApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    await enforceRateLimit("reset", requestIdentity(request), 8, 30 * 60_000);
    const input = resetPasswordSchema.parse(await parseJson(request));
    const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash: tokenHash(input.token) } });
    if (!reset || reset.usedAt || reset.expiresAt <= new Date()) throw new ApiError(400, "INVALID_RESET_TOKEN", "This reset link is invalid or has expired.");
    await prisma.$transaction([
      prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: await hashPassword(input.password) } }),
      prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
      prisma.session.deleteMany({ where: { userId: reset.userId } })
    ]);
    return jsonOk({ success: true });
  });
}
