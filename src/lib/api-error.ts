import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "The request is invalid.", details: error.flatten() } },
      { status: 400 }
    );
  }
  if (error instanceof ApiError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } },
    { status: 500 }
  );
}
