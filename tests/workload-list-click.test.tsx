import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkloadList } from "@/components/WorkloadList";
import type { WorkloadDefinition } from "@/lib/types";

const workload: WorkloadDefinition = { id: "tor-1", category: "งานหลัก", code: "1.1", title: "โครงการทดสอบ", weight: 10, targets: [] };

describe("workload list click target", () => {
  it("renders the TOR heading as a button for opening saved records", () => {
    const html = renderToStaticMarkup(<WorkloadList selectedId="" selectedCycle={{ number: 1, startDate: "2026-09-01", endDate: "2027-02-28", label: "รอบที่ 1" }} selectedEvaluationCycle={1} workloads={[workload]} logs={[]} isExporting={false} onCreate={() => undefined} onSelect={() => undefined} onEdit={() => undefined} onDelete={() => undefined} onExportWorkCycle={() => undefined} onOpenLogs={() => undefined} />);
    expect(html).toContain("ดูรายการที่บันทึกของ TOR 1.1");
  });
});
