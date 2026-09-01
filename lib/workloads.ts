import type { WorkloadCreateDraft, WorkloadEditDraft } from "@/lib/types";

export function validateWorkloadDraft(draft: WorkloadEditDraft): string | null {
  if (!draft.title.trim()) return "กรุณากรอกหัวข้อ TOR";
  if (!Number.isFinite(draft.weight) || draft.weight < 0 || draft.weight > 100) return "น้ำหนักต้องอยู่ระหว่าง 0 ถึง 100";
  return null;
}

export function validateNewWorkloadDraft(draft: WorkloadCreateDraft): string | null {
  if (!draft.code.trim()) return "กรุณากรอกรหัส TOR";
  return validateWorkloadDraft(draft);
}
