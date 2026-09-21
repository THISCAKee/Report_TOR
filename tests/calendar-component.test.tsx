import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Calendar } from "@/components/Calendar";
import type { WorkLog } from "@/lib/types";

const log: WorkLog = {
  id: "log-1",
  date: "2026-09-02",
  workloadId: "tor-1",
  evaluationCycle: 1,
  detail: "ตรวจเอกสาร",
  notes: "",
  quantity: "1",
  unit: "รายการ",
  attachments: [],
  createdAt: "2026-09-02T08:00:00.000Z",
  updatedAt: "2026-09-02T08:00:00.000Z",
};

const renderCalendar = (calendarLogs: WorkLog[] = [log], monthlyLogCount = 1) => renderToStaticMarkup(
  <Calendar
    month="2026-09"
    selectedDate="2026-09-02"
    logs={calendarLogs}
    monthlyLogCount={monthlyLogCount}
    isExporting={false}
    onExportMonth={() => undefined}
    onSelectDate={() => undefined}
    onChangeMonth={() => undefined}
  />,
);

describe("calendar table presentation", () => {
  it("renders the month as a contiguous seven-column grid of 42 date cells", () => {
    const html = renderCalendar();

    expect(html).toContain('data-calendar-grid="true"');
    expect(html).toContain("calendar-grid");
    expect((html.match(/data-calendar-cell="true"/g) ?? []).length).toBe(42);
  });

  it("marks dates with work logs as recorded cells and preserves selection", () => {
    const html = renderCalendar();

    expect(html).toContain('data-calendar-status="recorded"');
    expect(html).toContain("1 รายการ");
    expect(html).toContain('aria-pressed="true"');
  });

  it("renders a monthly Word export control for the visible month", () => {
    const html = renderCalendar();

    expect(html).toContain('aria-label="ดาวน์โหลด Word รายเดือน"');
    expect(html).toContain("ส่งออก Word รายเดือน");
  });

  it("disables monthly export when the visible month has no logs", () => {
    const html = renderCalendar([], 0);

    expect(html).toContain('aria-label="ดาวน์โหลด Word รายเดือน" disabled=""');
  });
});
