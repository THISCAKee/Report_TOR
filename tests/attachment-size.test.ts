import { describe, expect, it } from "vitest";
import { canAddAttachments } from "@/lib/attachment-size";

describe("canAddAttachments", () => {
  it("accepts attachments whose combined size is exactly 100 MB", () => {
    expect(canAddAttachments([60 * 1024 * 1024], [40 * 1024 * 1024])).toBe(true);
  });

  it("rejects attachments whose combined size exceeds 100 MB", () => {
    expect(canAddAttachments([60 * 1024 * 1024], [40 * 1024 * 1024 + 1])).toBe(false);
  });
});
