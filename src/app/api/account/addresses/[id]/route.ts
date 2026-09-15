import { NextRequest, NextResponse } from "next/server";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, parseJson } from "@/lib/route";
import { deleteAddress, listAddresses, retryAddressWrite, updateAddress } from "@/lib/profile";
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); const id = Number((await params).id); const input = await parseJson(request); await retryAddressWrite(() => updateAddress(user.id, id, input)); return NextResponse.json({ addresses: await listAddresses(user.id) }); }); }
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); const id = Number((await params).id); await retryAddressWrite(() => deleteAddress(user.id, id)); return NextResponse.json({ addresses: await listAddresses(user.id) }); }); }
