import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EntryForm } from "@/components/EntryForm";
import type { WorkLog, WorkloadDefinition } from "@/lib/types";

const workload: WorkloadDefinition = { id: "tor-1", category: "งานหลัก", code: "1.1", title: "โครงการทดสอบ", weight: 10, targets: [] };
const sourceLog: WorkLog = { id: "log-1", date: "2026-09-03", workloadId: "tor-1", evaluationCycle: 1, notes: "", detail: "ขึ้นเวรที่ DLP", quantity: "1", unit: "รายการ", attachments: [], createdAt: "2026-09-03T08:00:00.000Z", updatedAt: "2026-09-03T08:00:00.000Z" };

describe("duplicate entry form", () => {
  it("uses the chosen duplicate date instead of always using the next day", () => {
    const html = renderToStaticMarkup(<EntryForm selectedDate="2026-09-03" selectedWorkloadId="tor-1" selectedEvaluationCycle={1} workloads={[workload]} duplicateLog={sourceLog} duplicateDate="2026-09-10" onSave={() => undefined} onCancel={() => undefined} />);

    expect(html).toContain('value="2026-09-10"');
    expect(html).toContain("ขึ้นเวรที่ DLP");
    expect(html).toContain("บันทึกงานซ้ำ");
  });
});
