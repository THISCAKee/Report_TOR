import { describe, expect, it } from "vitest";
import { getThaiPublicHolidays, indexHolidaysByDate } from "@/lib/thai-holidays";

describe("Thai public holidays", () => {
  it("includes fixed Thai public holidays with Thai labels", () => {
    const holidays = getThaiPublicHolidays(2026);

    expect(holidays.find((holiday) => holiday.date === "2026-01-01")?.name).toContain("ปีใหม่");
    expect(holidays.find((holiday) => holiday.date === "2026-01-02")?.name).toContain("วันหยุดพิเศษ");
    expect(holidays.find((holiday) => holiday.date === "2026-04-13")?.name).toContain("สงกรานต์");
    expect(holidays.find((holiday) => holiday.date === "2026-06-01")?.name).toContain("ชดเชย");
  });

  it("indexes multiple holiday labels by ISO date", () => {
    expect(indexHolidaysByDate([
      { date: "2026-01-01", name: "วันขึ้นปีใหม่" },
      { date: "2026-01-01", name: "วันหยุดพิเศษ" },
    ])).toEqual({ "2026-01-01": ["วันขึ้นปีใหม่", "วันหยุดพิเศษ"] });
  });
});
