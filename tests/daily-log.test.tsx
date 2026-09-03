import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DailyLog } from "@/components/DailyLog";
import type { WorkLog, WorkloadDefinition } from "@/lib/types";

const workload: WorkloadDefinition = { id: "tor-1", category: "งานหลัก", code: "1.1", title: "โครงการทดสอบ", weight: 10, targets: [] };
const log: WorkLog = { id: "log-1", date: "2026-09-03", workloadId: "tor-1", evaluationCycle: 1, notes: "", detail: "ขึ้นเวรที่ DLP", quantity: "1", unit: "รายการ", attachments: [], createdAt: "2026-09-03T08:00:00.000Z", updatedAt: "2026-09-03T08:00:00.000Z" };

describe("daily log actions", () => {
  it("renders a duplicate action for each saved work log", () => {
    const html = renderToStaticMarkup(<DailyLog date={log.date} logs={[log]} workloads={[workload]} selectedIds={new Set()} onToggleSelection={() => undefined} onEdit={() => undefined} onDuplicate={() => undefined} />);

    expect(html).toContain("ทำซ้ำ");
    expect(html).toContain('aria-label="ทำซ้ำรายการ ขึ้นเวรที่ DLP"');
  });
});
