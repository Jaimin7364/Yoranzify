import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ApiError, errorResponse } from "./api-error";

describe("errorResponse", () => {
  it("formats known API errors", async () => {
    const response = errorResponse(new ApiError(404, "NOT_FOUND", "Not found"));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: { code: "NOT_FOUND", message: "Not found" } });
  });

  it("formats validation errors", async () => {
    const result = z.object({ name: z.string().min(2) }).safeParse({ name: "x" });
    if (result.success) throw new Error("Expected validation to fail");
    const response = errorResponse(result.error);
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
  });
});
