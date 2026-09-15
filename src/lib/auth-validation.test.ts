import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth-validation";
import { tokenHash, validateNextPath } from "./auth";

describe("authentication validation", () => {
  it("normalizes valid registration details", () => {
    const result = registerSchema.parse({ name: "  Mira Shah  ", email: "MIRA@EXAMPLE.COM", mobile: "+91 98765 43210", password: "Wardrobe9!", confirmPassword: "Wardrobe9!" });
    expect(result).toMatchObject({ name: "Mira Shah", email: "mira@example.com", mobile: "9876543210" });
  });

  it("rejects weak and mismatched passwords", () => {
    expect(registerSchema.safeParse({ name: "Mira Shah", email: "mira@example.com", mobile: "9876543210", password: "password", confirmPassword: "different" }).success).toBe(false);
  });

  it("normalizes login email", () => {
    expect(loginSchema.parse({ email: " USER@Example.com ", password: "x" }).email).toBe("user@example.com");
  });
});

describe("session helpers", () => {
  it("creates deterministic non-reversible token hashes", () => {
    expect(tokenHash("secret-token")).toHaveLength(64);
    expect(tokenHash("secret-token")).toBe(tokenHash("secret-token"));
    expect(tokenHash("secret-token")).not.toContain("secret-token");
  });

  it("blocks external and protocol-relative return paths", () => {
    expect(validateNextPath("/admin")).toBe("/admin");
    expect(validateNextPath("https://evil.example")).toBe("/account");
    expect(validateNextPath("//evil.example")).toBe("/account");
  });
});
