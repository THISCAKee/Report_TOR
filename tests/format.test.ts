import { describe, expect, it } from "vitest";
import { getNextIsoDate } from "@/lib/format";

describe("getNextIsoDate", () => {
  it("returns the next calendar date across month boundaries", () => {
    expect(getNextIsoDate("2026-09-30")).toBe("2026-10-01");
    expect(getNextIsoDate("2028-02-28")).toBe("2028-02-29");
  });
});
