import { describe, expect, it } from "vitest";
import { analyticsPeriod, percentageChange } from "./analytics";

describe("analytics helpers", () => {
  it("accepts supported reporting periods", () => { expect(analyticsPeriod("7")).toBe(7); expect(analyticsPeriod("365")).toBe(365); });
  it("defaults unsupported periods to 30 days", () => { expect(analyticsPeriod("12")).toBe(30); expect(analyticsPeriod()).toBe(30); });
  it("calculates change without dividing by zero", () => { expect(percentageChange(150, 100)).toBe(50); expect(percentageChange(100, 0)).toBe(100); expect(percentageChange(0, 0)).toBe(0); });
});
