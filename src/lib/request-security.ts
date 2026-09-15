import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { ApiError } from "./api-error";
import { prisma } from "./prisma";

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") throw new ApiError(403, "INVALID_ORIGIN", "The request origin is not allowed.");
  if (origin) {
    const originUrl = new URL(origin);
    const requestHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
    const requestProtocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
    if (originUrl.host !== requestHost || originUrl.protocol !== `${requestProtocol}:`) throw new ApiError(403, "INVALID_ORIGIN", "The request origin is not allowed.");
  }
}

export function requestIdentity(request: NextRequest, identifier = "anonymous") {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return createHash("sha256").update(`${ip}:${identifier.toLowerCase()}`).digest("hex");
}

export async function enforceRateLimit(scope: string, identity: string, maximum: number, windowMs: number) {
  const key = `${scope}:${identity}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);
  await prisma.$executeRaw`
    INSERT INTO RateLimit (\`key\`, attempts, resetAt, updatedAt)
    VALUES (${key}, 1, ${resetAt}, ${now})
    ON DUPLICATE KEY UPDATE
      attempts = IF(resetAt <= ${now}, 1, attempts + 1),
      resetAt = IF(resetAt <= ${now}, ${resetAt}, resetAt),
      updatedAt = ${now}
  `;
  const record = await prisma.rateLimit.findUniqueOrThrow({ where: { key } });
  if (record.attempts > maximum) throw new ApiError(429, "RATE_LIMITED", "Too many attempts. Please try again later.");
}
