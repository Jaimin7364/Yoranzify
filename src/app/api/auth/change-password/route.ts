import { NextRequest } from "next/server";
import { changePasswordSchema } from "@/lib/auth-validation";
import { hashPassword, requireRequestUser, userFromRequest, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { ApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const authUser = requireRequestUser(await userFromRequest(request));
    const input = changePasswordSchema.parse(await parseJson(request));
    const user = await prisma.user.findUniqueOrThrow({ where: { id: authUser.id } });
    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) throw new ApiError(400, "INVALID_PASSWORD", "Current password is incorrect.");
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(input.password) } }),
      prisma.session.deleteMany({ where: { userId: user.id } })
    ]);
    return jsonOk({ success: true });
  });
}
