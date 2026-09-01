"use client";

import { useState } from "react";
import { validateWorkloadDraft } from "@/lib/workloads";
import type { WorkloadDefinition, WorkloadEditDraft } from "@/lib/types";

type Props = {
  workload: WorkloadDefinition;
  onSave: (draft: WorkloadEditDraft) => Promise<void>;
  onCancel: () => void;
};

export function WorkloadEditor({ workload, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(workload.title);
  const [weight, setWeight] = useState(String(workload.weight));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!weight.trim()) {
      setError("กรุณากรอกน้ำหนัก");
      return;
    }
    const draft = { title, weight: Number(weight) } satisfies WorkloadEditDraft;
    const validationError = validateWorkloadDraft(draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({ title: title.trim(), weight: draft.weight });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "แก้ไขข้อมูล TOR ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(23,35,63,.42)] p-0 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <form role="dialog" aria-modal="true" aria-labelledby="workload-editor-title" onSubmit={(event) => void submit(event)} className="w-full max-w-lg rounded-t-3xl bg-[var(--paper)] p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--blue)]">แก้ไข TOR {workload.code}</p><h2 id="workload-editor-title" className="mt-1 text-xl font-semibold">แก้ไขหัวข้อและน้ำหนัก</h2></div><button type="button" onClick={onCancel} className="focus-ring rounded-xl px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[#e9e8e2]">ปิด</button></div>
        <div className="mt-6 space-y-4"><div><label className="mb-2 block text-sm font-semibold" htmlFor="workload-title">หัวข้อ TOR <span className="text-[var(--red)]">*</span></label><input id="workload-title" value={title} onChange={(event) => setTitle(event.target.value)} className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 shadow-sm" /></div><div><label className="mb-2 block text-sm font-semibold" htmlFor="workload-weight">น้ำหนัก (%) <span className="text-[var(--red)]">*</span></label><input id="workload-weight" type="number" min="0" max="100" step="0.01" value={weight} onChange={(event) => setWeight(event.target.value)} className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 shadow-sm" /><p className="mt-1.5 text-xs text-[var(--muted)]">ระบุค่าได้ตั้งแต่ 0 ถึง 100</p></div></div>
        {error ? <p role="alert" className="mt-4 rounded-xl bg-[#fff1f1] px-3.5 py-3 text-sm leading-6 text-[var(--red)]">{error}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="focus-ring rounded-xl px-4 py-3 text-sm font-semibold text-[var(--muted)] hover:bg-[#f0f0ed]">ยกเลิก</button><button type="submit" disabled={saving} className="focus-ring rounded-xl bg-[var(--blue)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(47,86,211,.22)] transition hover:bg-[#2548b5] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "กำลังบันทึก…" : "บันทึกการแก้ไข"}</button></div>
      </form>
    </div>
  );
}
