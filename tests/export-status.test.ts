import { describe, expect, it } from "vitest";
import { getWordExportStatusText } from "@/lib/export-status";

describe("Word export status", () => {
  it("shows a clear message for each export phase", () => {
    expect(getWordExportStatusText("idle")).toBe("");
    expect(getWordExportStatusText("preparing")).toBe("กำลังรวมไฟล์แนบ…");
    expect(getWordExportStatusText("compressing")).toBe("กำลังย่อรูปภาพ…");
    expect(getWordExportStatusText("building")).toBe("กำลังสร้างไฟล์ Word…");
    expect(getWordExportStatusText("downloading")).toBe("กำลังดาวน์โหลด…");
  });
});
