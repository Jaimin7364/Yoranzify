import type { NextRequest, NextResponse } from "next/server";
import { CART_COOKIE, newGuestCartToken } from "./cart";
import { userFromRequest } from "./auth";

export async function cartIdentityFromRequest(request: NextRequest, createGuest = false) { const user = await userFromRequest(request); const existingToken = request.cookies.get(CART_COOKIE)?.value; const guestToken = user ? null : existingToken ?? (createGuest ? newGuestCartToken() : null); return { identity: { userId: user?.id, guestToken }, newGuestToken: !user && !existingToken ? guestToken : null }; }
export function setGuestCartCookie(response: NextResponse, token: string | null) { if (!token) return; response.cookies.set(CART_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 24 * 60 * 60, priority: "high" }); }
export function clearGuestCartCookie(response: NextResponse) { response.cookies.set(CART_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 }); }
