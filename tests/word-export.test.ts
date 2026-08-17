import { describe, expect, it } from "vitest";
import { buildImageWordDocument } from "@/lib/word-export";
import type { WorkLog, WorkloadDefinition } from "@/lib/types";

const workloads: WorkloadDefinition[] = [
  { id: "a", category: "งานหลัก", code: "A", title: "งานเอกสาร", weight: 50, targets: [] },
  { id: "b", category: "งานรอง", code: "B", title: "งานบริการ", weight: 50, targets: [] },
];

const imageLog = (id: string, date: string, workloadId: string, imageName: string): WorkLog => ({
  id,
  date,
  workloadId,
  detail: "รายละเอียด",
  notes: "",
  quantity: "1",
  unit: "รายการ",
  attachments: [{ id: imageName, name: imageName, size: 100, type: "image/png", dataUrl: "data:image/png;base64,abc", width: 100, height: 80 }],
  createdAt: `${date}T0${id}:00:00.000Z`,
  updatedAt: `${date}T0${id}:00:00.000Z`,
});

describe("image Word export", () => {
  it("renders numbered workload headings with images in log order", () => {
    const document = buildImageWordDocument("2026-08-15", [imageLog("2", "2026-08-15", "b", "second.png"), imageLog("1", "2026-08-15", "a", "first.png")], workloads);
    expect(document.indexOf("หัวข้อที่ 1 A งานเอกสาร")).toBeLessThan(document.indexOf("หัวข้อที่ 2 B งานบริการ"));
    expect(document.indexOf("first.png")).toBeLessThan(document.indexOf("second.png"));
    expect(document.match(/<img /g)).toHaveLength(2);
  });

  it("omits logs without image attachments", () => {
    const document = buildImageWordDocument("2026-08-15", [{ ...imageLog("1", "2026-08-15", "a", "file.pdf"), attachments: [{ id: "file", name: "file.pdf", size: 10, type: "application/pdf", dataUrl: "" }] }], workloads);
    expect(document).toContain("ไม่มีรูปภาพแนบในรายการนี้");
    expect(document).not.toContain("<img ");
  });
});
