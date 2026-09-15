import { describe, expect, it } from "vitest";
import { addressSchema, profileSchema } from "./profile";
describe("profile and Indian address validation", () => {
  it("normalizes Indian mobile numbers", () => { expect(profileSchema.parse({ name: "Aanya Shah", email: " AANYA@example.com ", mobile: "+91 98765 43210" })).toEqual({ name: "Aanya Shah", email: "aanya@example.com", mobile: "9876543210" }); });
  it("accepts a valid Indian address", () => { expect(addressSchema.parse({ fullName: "Aanya Shah", mobile: "9876543210", line1: "12 Studio Road", city: "Ahmedabad", state: "Gujarat", postalCode: "380015", country: "India", type: "HOME", isDefaultShipping: true }).postalCode).toBe("380015"); });
  it("rejects invalid PIN codes and non-Indian addresses", () => { expect(() => addressSchema.parse({ fullName: "Aanya Shah", mobile: "9876543210", line1: "12 Studio Road", city: "Ahmedabad", state: "Gujarat", postalCode: "000000", country: "India", type: "HOME" })).toThrow(); expect(() => addressSchema.parse({ fullName: "Aanya Shah", mobile: "9876543210", line1: "12 Studio Road", city: "Paris", state: "Paris", postalCode: "380015", country: "France", type: "HOME" })).toThrow(); });
});
