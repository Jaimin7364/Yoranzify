import { describe, expect, it } from "vitest";
import { detectImageType, parseUploadKind } from "./media";

describe("media validation", () => {
  it("detects supported image signatures instead of trusting extensions", () => {
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe("image/jpeg");
    expect(detectImageType(new TextEncoder().encode("not an image at all"))).toBeNull();
  });

  it("allows only known media kinds", () => {
    expect(parseUploadKind("logo")).toBe("LOGO");
    expect(() => parseUploadKind("document")).toThrow("valid media type");
  });
});
