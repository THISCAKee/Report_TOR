import { describe, expect, it } from "vitest";
import { buildWorkloadStatisticsExcel } from "@/lib/excel-export";
import { countWorkloadOccurrences, filterLogsByScope, summarizeMonthlyWorkloadOccurrences, summarizeWorkloadOccurrencesForMonth, summarizeLogsByDate } from "@/lib/work-log-insights";
import type { WorkLog, WorkloadDefinition } from "@/lib/types";

const workloads: WorkloadDefinition[] = [
  { id: "a", category: "งานหลัก", code: "A", title: "งานเอกสาร", weight: 50, targets: [] },
  { id: "b", category: "งานรอง", code: "B", title: "งานบริการ", weight: 50, targets: [] },
];

const log = (id: string, date: string, workloadId: string, attachments = 0): WorkLog => ({
  id,
  date,
  workloadId,
  detail: `รายละเอียด ${id}`,
  notes: "",
  quantity: "1",
  unit: "รายการ",
  attachments: Array.from({ length: attachments }, (_, index) => ({ id: `${id}-${index}`, name: `file-${index}`, size: 10, type: "text/plain", dataUrl: "" })),
  createdAt: `${date}T08:00:00.000Z`,
  updatedAt: `${date}T08:00:00.000Z`,
});

describe("work log insights", () => {
  const logs = [log("1", "2026-08-14", "a", 2), log("2", "2026-08-15", "a"), log("3", "2026-08-15", "b", 1), log("4", "2026-07-31", "b")];

  it("summarizes dates newest first with log and attachment counts", () => {
    expect(summarizeLogsByDate(logs)).toEqual([
      { date: "2026-08-15", logCount: 2, fileCount: 1 },
      { date: "2026-08-14", logCount: 1, fileCount: 2 },
      { date: "2026-07-31", logCount: 1, fileCount: 0 },
    ]);
  });

  it("counts workload occurrences across every date and excludes unknown workloads", () => {
    expect(countWorkloadOccurrences([...logs, log("5", "2026-08-16", "unknown")], workloads)).toEqual([
      { workloadId: "a", code: "A", title: "งานเอกสาร", count: 2 },
      { workloadId: "b", code: "B", title: "งานบริการ", count: 2 },
    ]);
  });

  it("filters logs by exact day or selected month", () => {
    expect(filterLogsByScope(logs, "2026-08-15", "day").map((item) => item.id)).toEqual(["2", "3"]);
    expect(filterLogsByScope(logs, "2026-08-15", "month").map((item) => item.id)).toEqual(["1", "2", "3"]);
  });

  it("summarizes workload occurrences for the selected month only", () => {
    expect(summarizeMonthlyWorkloadOccurrences(logs, "2026-08-15", workloads)).toEqual([
      { workloadId: "a", code: "A", title: "งานเอกสาร", count: 2 },
      { workloadId: "b", code: "B", title: "งานบริการ", count: 1 },
    ]);
  });

  it("uses an explicitly selected month for statistics", () => {
    expect(summarizeWorkloadOccurrencesForMonth(logs, "2026-07", workloads)).toEqual([
      { workloadId: "b", code: "B", title: "งานบริการ", count: 1 },
    ]);
  });

  it("returns empty insights for empty logs", () => {
    expect(summarizeLogsByDate([])).toEqual([]);
    expect(countWorkloadOccurrences([], workloads)).toEqual([]);
    expect(filterLogsByScope([], "2026-08-15", "month")).toEqual([]);
  });

  it("builds an Excel-compatible statistics workbook with numeric counts", () => {
    const workbook = buildWorkloadStatisticsExcel("2026-08", [
      { workloadId: "a", code: "A", title: "งาน <เอกสาร>", count: 2 },
    ]);
    expect(workbook).toContain("สถิติการทำงาน เดือน 2026-08");
    expect(workbook).toContain("งาน &lt;เอกสาร&gt;");
    expect(workbook).toContain('ss:Type="Number">2');
  });
});
