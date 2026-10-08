import { describe, expect, it } from "vitest";
import { reviewInputSchema, reviewModerationSchema } from "./reviews";

describe("review validation", () => {
  it("accepts a complete one-to-five-star review", () => { expect(reviewInputSchema.parse({ orderItemId: 8, rating: 5, title: "Lovely fit", comment: "The fabric and fit are excellent." }).rating).toBe(5); });
  it("rejects invalid ratings and very short comments", () => { expect(reviewInputSchema.safeParse({ orderItemId: 8, rating: 6, title: "", comment: "Good" }).success).toBe(false); });
  it("allows only public approval or hiding", () => { expect(reviewModerationSchema.safeParse({ status: "APPROVED" }).success).toBe(true); expect(reviewModerationSchema.safeParse({ status: "PENDING" }).success).toBe(false); });
});
