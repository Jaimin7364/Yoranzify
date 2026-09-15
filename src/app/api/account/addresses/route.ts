import { NextRequest, NextResponse } from "next/server";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, parseJson } from "@/lib/route";
import { createAddress, listAddresses, retryAddressWrite } from "@/lib/profile";
export async function GET(request: NextRequest) { return handleRoute(async () => { const user = requireRequestUser(await userFromRequest(request)); return NextResponse.json({ addresses: await listAddresses(user.id) }); }); }
export async function POST(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); const input = await parseJson(request); await retryAddressWrite(() => createAddress(user.id, input)); return NextResponse.json({ addresses: await listAddresses(user.id) }, { status: 201 }); }); }
