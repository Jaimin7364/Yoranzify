import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import type { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { ApiError } from "./api-error";
import type { SafeUser } from "./auth-validation";

export const SESSION_COOKIE = "yoranzify_session";
const SESSION_DAYS = 30;

export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string) { return hash(password, 12); }
export async function verifyPassword(password: string, passwordHash: string) { return compare(password, passwordHash); }

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { tokenHash: tokenHash(token), userId, expiresAt } });
  return { token, expiresAt };
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high"
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

function safeUser(user: { id: number; name: string; email: string; mobile: string; role: "CUSTOMER" | "ADMIN" }): SafeUser {
  return { id: user.id, name: user.name, email: user.email, mobile: user.mobile, role: user.role };
}

export async function userFromToken(token?: string | null): Promise<SafeUser | null> {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: tokenHash(token) },
    include: { user: true }
  });
  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  return safeUser(session.user);
}

export async function currentUser() {
  const cookieStore = await cookies();
  return userFromToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function userFromRequest(request: NextRequest) {
  return userFromToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function requireUser(next?: string) {
  const user = await currentUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) redirect("/login?next=%2Fadmin");
  if (user.role !== "ADMIN") redirect("/unauthorized");
  return user;
}

export function requireRequestUser(user: SafeUser | null) {
  if (!user) throw new ApiError(401, "UNAUTHORIZED", "Please sign in to continue.");
  return user;
}

export function requireRequestAdmin(user: SafeUser | null) {
  const authenticated = requireRequestUser(user);
  if (authenticated.role !== "ADMIN") throw new ApiError(403, "FORBIDDEN", "Administrator access is required.");
  return authenticated;
}

export function validateNextPath(value: unknown, fallback = "/account") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : fallback;
}
