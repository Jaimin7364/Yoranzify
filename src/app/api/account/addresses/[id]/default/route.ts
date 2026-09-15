import { NextRequest, NextResponse } from "next/server";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute } from "@/lib/route";
import { listAddresses, retryAddressWrite, setDefaultAddress } from "@/lib/profile";
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); const id = Number((await params).id); await retryAddressWrite(() => setDefaultAddress(user.id, id)); return NextResponse.json({ addresses: await listAddresses(user.id) }); }); }
