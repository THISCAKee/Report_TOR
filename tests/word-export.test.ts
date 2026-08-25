import { describe, expect, it } from "vitest";
import { buildMonthlyWorkloadWordDocument, buildWorkCycleWordDocument } from "@/lib/word-export";
import type { WorkLog, WorkloadDefinition } from "@/lib/types";

const workloads: WorkloadDefinition[] = [
  { id: "a", category: "งานหลัก", code: "A", title: "งานเอกสาร", weight: 50, targets: [] },
  { id: "b", category: "งานรอง", code: "B", title: "งานบริการ", weight: 50, targets: [] },
  { id: "c", category: "งานอื่น ๆ", code: "C", title: "งานทั่วไป", weight: 0, targets: [] },
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

describe("monthly workload Word export", () => {
  it("shows the selected workload total and each occurrence in chronological order", () => {
    const laterLog = { ...imageLog("2", "2026-08-20", "a", "later.png"), detail: "งานครั้งหลัง" };
    const earlierLog = { ...imageLog("1", "2026-08-03", "a", "earlier.png"), detail: "งานครั้งแรก" };

    const document = buildMonthlyWorkloadWordDocument("2026-08-01", [laterLog, earlierLog], workloads[0]);

    expect(document).toContain("รายงานประจำเดือน สิงหาคม พ.ศ. 2569");
    expect(document).toContain("A งานเอกสาร");
    expect(document).toContain("เดือนนี้ดำเนินการแล้ว 2 ครั้ง");
    expect(document.indexOf("ครั้งที่ 1")).toBeLessThan(document.indexOf("ครั้งที่ 2"));
    expect(document.indexOf("งานครั้งแรก")).toBeLessThan(document.indexOf("งานครั้งหลัง"));
    expect(document.indexOf("earlier.png")).toBeLessThan(document.indexOf("later.png"));
    expect(document.match(/<img /g)).toHaveLength(2);
  });

  it("counts entries without images and omits non-image attachments", () => {
    const log = {
      ...imageLog("1", "2026-08-03", "a", "file.pdf"),
      attachments: [{ id: "file", name: "file.pdf", size: 10, type: "application/pdf", dataUrl: "data:application/pdf;base64,abc" }],
    };

    const document = buildMonthlyWorkloadWordDocument("2026-08-01", [log], workloads[0]);

    expect(document).toContain("เดือนนี้ดำเนินการแล้ว 1 ครั้ง");
    expect(document).toContain("ไม่มีรูปภาพแนบ");
    expect(document).not.toContain("file.pdf");
    expect(document).not.toContain("<img ");
  });
});

describe("work cycle Word export", () => {
  it("includes all workloads and identifies the selected work cycle", () => {
    const logs = [
      { ...imageLog("1", "2026-09-10", "a", "september.png"), detail: "งานเดือนกันยายน" },
      { ...imageLog("2", "2027-02-28", "b", "february.png"), detail: "งานเดือนกุมภาพันธ์" },
    ];

    const document = buildWorkCycleWordDocument("2026-09-01", "2027-02-28", logs, workloads);

    expect(document).toContain("รายงานการปฏิบัติงาน รอบที่ 1");
    expect(document).toContain("1 ก.ย. 69 ถึง 28 ก.พ. 70");
    expect(document).toContain("A งานเอกสาร");
    expect(document).toContain("B งานบริการ");
    expect(document).toContain("งานเดือนกันยายน");
    expect(document).toContain("งานเดือนกุมภาพันธ์");
    expect(document).toContain("สรุปจำนวนครั้งตามงาน");
    expect(document).toContain("<td>C</td>");
    expect(document).toContain("<td>งานทั่วไป</td>");
    expect(document).toContain("0 ครั้ง");
  });
});
