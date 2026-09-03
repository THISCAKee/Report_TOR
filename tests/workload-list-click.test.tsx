import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WorkloadList } from "@/components/WorkloadList";
import type { WorkloadDefinition } from "@/lib/types";

const workload: WorkloadDefinition = { id: "tor-1", category: "งานหลัก", code: "1.1", title: "โครงการทดสอบ", weight: 10, targets: [] };
const secondaryWorkload: WorkloadDefinition = { id: "tor-2", category: "งานรอง", code: "2.1", title: "งานรองทดสอบ", weight: 5, targets: [] };

describe("workload list click target", () => {
  it("renders the TOR heading as a button for opening saved records", () => {
    const html = renderToStaticMarkup(<WorkloadList selectedId="tor-1" selectedCycle={{ number: 1, startDate: "2026-09-01", endDate: "2027-02-28", label: "รอบที่ 1" }} selectedEvaluationCycle={1} workloads={[workload]} logs={[]} isExporting={false} onCreate={() => undefined} onSelect={() => undefined} onEdit={() => undefined} onDelete={() => undefined} onExportWorkCycle={() => undefined} onOpenLogs={() => undefined} />);
    expect(html).toContain("ดูรายการที่บันทึกของ TOR 1.1");
  });

  it("renders TOR choices in grouped dropdown options", () => {
    const html = renderToStaticMarkup(<WorkloadList selectedId="" selectedCycle={{ number: 1, startDate: "2026-09-01", endDate: "2027-02-28", label: "รอบที่ 1" }} selectedEvaluationCycle={1} workloads={[workload, secondaryWorkload]} logs={[]} isExporting={false} onCreate={() => undefined} onSelect={() => undefined} onEdit={() => undefined} onDelete={() => undefined} onExportWorkCycle={() => undefined} onOpenLogs={() => undefined} />);

    expect(html).toContain('aria-label="เลือกรายการ TOR"');
    expect(html).toContain('<optgroup label="งานหลัก">');
    expect(html).toContain('<optgroup label="งานรอง">');
    expect(html).toContain('value="tor-1"');
    expect(html).toContain("1.1 — โครงการทดสอบ");
    expect(html).toContain("ยังไม่ได้เลือกหัวข้องาน");
  });

  it("shows actions only for the selected TOR", () => {
    const html = renderToStaticMarkup(<WorkloadList selectedId="tor-1" selectedCycle={{ number: 1, startDate: "2026-09-01", endDate: "2027-02-28", label: "รอบที่ 1" }} selectedEvaluationCycle={1} workloads={[workload, secondaryWorkload]} logs={[]} isExporting={false} onCreate={() => undefined} onSelect={() => undefined} onEdit={() => undefined} onDelete={() => undefined} onExportWorkCycle={() => undefined} onOpenLogs={() => undefined} />);

    expect(html).toContain("โครงการทดสอบ");
    expect(html).toContain("แก้ไข");
    expect(html).toContain("ลบ");
    expect(html).toContain('aria-label="ดาวน์โหลดรายงาน Word 1.1 โครงการทดสอบ"');
    expect(html).not.toContain('aria-label="ดาวน์โหลดรายงาน Word 2.1 งานรองทดสอบ"');
  });

  it("renders the entry form slot below the selected TOR", () => {
    const html = renderToStaticMarkup(<WorkloadList selectedId="tor-1" selectedCycle={{ number: 1, startDate: "2026-09-01", endDate: "2027-02-28", label: "รอบที่ 1" }} selectedEvaluationCycle={1} workloads={[workload]} logs={[]} isExporting={false} onCreate={() => undefined} onSelect={() => undefined} onEdit={() => undefined} onDelete={() => undefined} onExportWorkCycle={() => undefined} onOpenLogs={() => undefined}><div data-entry-form="true">กรอกข้อมูลการทำงาน</div></WorkloadList>);

    expect(html).toContain('data-entry-form="true"');
    expect(html).toContain("กรอกข้อมูลการทำงาน");
  });
});
