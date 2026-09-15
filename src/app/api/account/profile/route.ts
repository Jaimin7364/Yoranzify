import { NextRequest, NextResponse } from "next/server";
import { requireRequestUser, userFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, parseJson } from "@/lib/route";
import { updateProfile } from "@/lib/profile";
export async function PATCH(request: NextRequest) { return handleRoute(async () => { assertSameOrigin(request); const user = requireRequestUser(await userFromRequest(request)); return NextResponse.json({ user: await updateProfile(user.id, await parseJson(request)) }); }); }
