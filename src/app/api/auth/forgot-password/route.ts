import { randomBytes } from "node:crypto";
import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/auth-validation";
import { tokenHash } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { assertSameOrigin, enforceRateLimit, requestIdentity } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { enqueueEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const { email } = forgotPasswordSchema.parse(await parseJson(request));
    await enforceRateLimit("forgot", requestIdentity(request, email), 4, 30 * 60_000);
    const user = await prisma.user.findUnique({ where: { email } });
    let devResetToken: string | undefined;
    if (user?.isActive) {
      const token = randomBytes(32).toString("base64url");
      await prisma.$transaction(async (tx) => { await tx.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } }); const reset = await tx.passwordResetToken.create({ data: { tokenHash: tokenHash(token), userId: user.id, expiresAt: new Date(Date.now() + 30 * 60_000) } }); await enqueueEmail(tx, `password-reset:${reset.id}`, user.email, "PASSWORD_RESET", { name: user.name, url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${encodeURIComponent(token)}` }); });
      if (process.env.NODE_ENV !== "production") { devResetToken = token; logger.info("Development password reset created", { email, token }); }
    }
    return jsonOk({ message: "If an account exists, a password reset link has been sent.", ...(devResetToken ? { devResetToken } : {}) });
  });
}
