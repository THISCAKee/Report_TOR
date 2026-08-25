import { describe, expect, it } from "vitest";
import { filterLogsByWorkCycle, filterLogsByWorkCycleAndWorkload, getWorkCycle } from "@/lib/work-cycles";
import type { WorkLog } from "@/lib/types";

const log = (id: string, date: string): WorkLog => ({
  id,
  date,
  workloadId: "a",
  detail: id,
  notes: "",
  quantity: "1",
  unit: "รายการ",
  attachments: [],
  createdAt: `${date}T08:00:00.000Z`,
  updatedAt: `${date}T08:00:00.000Z`,
});

describe("work cycles", () => {
  it("maps September through February to cycle 1 across calendar years", () => {
    expect(getWorkCycle("2026-09-01")).toEqual({
      number: 1,
      startDate: "2026-09-01",
      endDate: "2027-02-28",
      label: "รอบที่ 1",
    });
    expect(getWorkCycle("2028-02-29")).toEqual({
      number: 1,
      startDate: "2027-09-01",
      endDate: "2028-02-29",
      label: "รอบที่ 1",
    });
  });

  it("maps March through August to cycle 2", () => {
    expect(getWorkCycle("2027-03-01")).toEqual({
      number: 2,
      startDate: "2027-03-01",
      endDate: "2027-08-31",
      label: "รอบที่ 2",
    });
    expect(getWorkCycle("2027-08-31")).toEqual({
      number: 2,
      startDate: "2027-03-01",
      endDate: "2027-08-31",
      label: "รอบที่ 2",
    });
  });

  it("filters logs inclusively within the selected work cycle", () => {
    const logs = [
      log("before", "2026-08-31"),
      log("start", "2026-09-01"),
      log("middle", "2027-01-15"),
      log("end", "2027-02-28"),
      log("after", "2027-03-01"),
    ];

    expect(filterLogsByWorkCycle(logs, "2026-09").map((item) => item.id)).toEqual(["start", "middle", "end"]);
  });

  it("filters a single workload across the selected work cycle", () => {
    const logs = [
      log("inside-a", "2026-09-10"),
      { ...log("inside-b", "2026-10-10"), workloadId: "b" },
      { ...log("outside-a", "2027-03-01"), workloadId: "a" },
    ];

    expect(filterLogsByWorkCycleAndWorkload(logs, "2026-09", "a").map((item) => item.id)).toEqual(["inside-a"]);
  });
});
