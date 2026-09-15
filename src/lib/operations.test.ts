import { beforeEach, describe, expect, it } from "vitest";
import { validJobSecret } from "./operations";
describe("operations authentication", () => { beforeEach(() => { process.env.OPS_JOB_SECRET = "12345678901234567890123456789012"; }); it("requires an exact bearer secret", () => { expect(validJobSecret("Bearer 12345678901234567890123456789012")).toBe(true); expect(validJobSecret("Bearer wrong")).toBe(false); }); });
