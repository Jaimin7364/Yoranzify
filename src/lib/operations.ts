import { timingSafeEqual } from "node:crypto";
import { prisma } from "./prisma";
import { deliverOutbox } from "./email";
import { releaseExpiredPayments } from "./payments";
export function validJobSecret(received: string | null) { const expected = process.env.OPS_JOB_SECRET; if (!expected || expected.length < 32 || !received) return false; const a = Buffer.from(expected); const b = Buffer.from(received.replace(/^Bearer\s+/i, "")); return a.length === b.length && timingSafeEqual(a, b); }
export async function runOperations() { const now = new Date(); const [sessions, tokens, rates, released, mail] = await Promise.all([prisma.session.deleteMany({ where: { expiresAt: { lte: now } } }), prisma.passwordResetToken.deleteMany({ where: { OR: [{ expiresAt: { lte: now } }, { usedAt: { not: null } }] } }), prisma.rateLimit.deleteMany({ where: { resetAt: { lte: now } } }), releaseExpiredPayments(), deliverOutbox()]); return { sessions: sessions.count, resetTokens: tokens.count, rateLimits: rates.count, releasedPayments: released, mail }; }
