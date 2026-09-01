import { describe, expect, it } from "vitest";
import { buildCalendarDays, formatCalendarMonth, getDateLogCounts } from "@/lib/calendar";
import type { WorkLog } from "@/lib/types";

const log = (id: string, date: string): WorkLog => ({
  id,
  date,
  workloadId: "workload",
  evaluationCycle: 1,
  detail: id,
  notes: "",
  quantity: "1",
  unit: "รายการ",
  attachments: [],
  createdAt: `${date}T08:00:00.000Z`,
  updatedAt: `${date}T08:00:00.000Z`,
});

describe("calendar helpers", () => {
  it("builds a six-week Sunday-first grid with standard ISO dates", () => {
    const days = buildCalendarDays("2026-09");

    expect(days).toHaveLength(42);
    expect(days[0]).toMatchObject({ date: "2026-08-30", day: 30, inCurrentMonth: false });
    expect(days.find((day) => day.date === "2026-09-01")).toMatchObject({ day: 1, inCurrentMonth: true });
    expect(days.at(-1)).toMatchObject({ date: "2026-10-10", day: 10, inCurrentMonth: false });
  });

  it("formats a Thai month title with Buddhist year", () => {
    expect(formatCalendarMonth("2026-09")).toBe("กันยายน พ.ศ. 2569");
  });

  it("counts logs by date for calendar badges", () => {
    expect(getDateLogCounts([log("a", "2026-09-05"), log("b", "2026-09-05"), log("c", "2026-09-21")] )).toEqual({
      "2026-09-05": 2,
      "2026-09-21": 1,
    });
  });
});
