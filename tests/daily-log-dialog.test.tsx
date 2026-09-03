import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DailyLogDialog } from "@/components/DailyLogDialog";
import type { WorkLog, WorkloadDefinition } from "@/lib/types";

const workload: WorkloadDefinition = { id: "tor-1", category: "งานหลัก", code: "1.1", title: "โครงการทดสอบ", weight: 10, targets: [] };
const log: WorkLog = { id: "log-1", date: "2026-09-03", workloadId: "tor-1", evaluationCycle: 1, notes: "", detail: "ทดสอบการแสดงรายการ", quantity: "1", unit: "รายการ", attachments: [], createdAt: "2026-09-03T08:00:00.000Z", updatedAt: "2026-09-03T08:00:00.000Z" };

describe("daily log display", () => {
  it("renders selected-date logs as an inline panel without a modal dialog", () => {
    const html = renderToStaticMarkup(<DailyLogDialog inline date="2026-09-03" logs={[log]} workloads={[workload]} onEdit={() => undefined} onDelete={async () => undefined} onClose={() => undefined} />);

    expect(html).toContain('aria-labelledby="daily-log-panel-title"');
    expect(html).toContain("ทดสอบการแสดงรายการ");
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain("backdrop-blur");
  });
});
