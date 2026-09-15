import { NextRequest } from "next/server";
import { userFromRequest } from "@/lib/auth";
import { handleRoute, jsonOk } from "@/lib/route";

export async function GET(request: NextRequest) { return handleRoute(async () => jsonOk({ user: await userFromRequest(request) })); }
