import { describe, expect, it } from "vitest";
import { supplierInputSchema } from "./suppliers";

const valid = { name: "Mahakal Enterprises", legalName: "Mahakal Enterprises", gstNumber: "24ABCDE1234F1Z5", contactName: "Sales", contactNumber: "9876543210", email: "sales@example.com", address: "101 Textile Market", city: "Ahmedabad", state: "Gujarat", postalCode: "380001", isActive: true };

describe("supplierInputSchema", () => {
  it("accepts valid Indian supplier details", () => { expect(supplierInputSchema.parse(valid).gstNumber).toBe(valid.gstNumber); });
  it("normalizes formatted phone numbers", () => { expect(supplierInputSchema.parse({ ...valid, contactNumber: "+91 98765 43210" }).contactNumber).toBe("919876543210"); });
  it("rejects invalid GST and PIN values", () => { expect(supplierInputSchema.safeParse({ ...valid, gstNumber: "BAD" }).success).toBe(false); expect(supplierInputSchema.safeParse({ ...valid, postalCode: "123" }).success).toBe(false); });
});
