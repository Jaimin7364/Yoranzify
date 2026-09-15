import { NextResponse } from "next/server";
import { logger } from "./logger";
import { errorResponse } from "./api-error";

export async function parseJson(request: Request) {
  try { return await request.json(); }
  catch { return {}; }
}

export async function handleRoute<T>(operation: () => Promise<T>) {
  try { return await operation(); }
  catch (error) {
    logger.warn("API request failed", { error: error instanceof Error ? error.message : "Unknown error" });
    return errorResponse(error);
  }
}

export function jsonOk<T>(data: T, status = 200) { return NextResponse.json(data, { status }); }
