import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api-error";
import { runOperations, validJobSecret } from "@/lib/operations";
import { handleRoute, jsonOk } from "@/lib/route";
export async function POST(request: NextRequest) { return handleRoute(async () => { if (!validJobSecret(request.headers.get("authorization"))) throw new ApiError(401, "INVALID_JOB_SECRET", "Valid job authorization is required."); return jsonOk(await runOperations()); }); }
