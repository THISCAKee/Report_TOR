"use client";

import { useState } from "react";
import type { WorkloadCategory, WorkloadCreateDraft } from "@/lib/types";
import { WORKLOAD_CATEGORIES } from "@/lib/workload-data";
import { validateNewWorkloadDraft } from "@/lib/workloads";

type Props = {
  onSave: (draft: WorkloadCreateDraft) => Promise<void>;
  onCancel: () => void;
};

export function WorkloadCreateDialog({ onSave, onCancel }: Props) {
  const [category, setCategory] = useState<WorkloadCategory>("งานหลัก");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!weight.trim()) return setError("กรุณากรอกน้ำหนัก");
    const draft = { category, code, title, weight: Number(weight) } satisfies WorkloadCreateDraft;
    const validationError = validateNewWorkloadDraft(draft);
    if (validationError) return setError(validationError);
    setSaving(true);
    setError("");
    try {
      await onSave({ ...draft, code: code.trim(), title: title.trim() });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "เพิ่มรายการ TOR ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(23,35,63,.42)] p-0 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <form role="dialog" aria-modal="true" aria-labelledby="workload-create-title" onSubmit={(event) => void submit(event)} className="w-full max-w-lg rounded-t-3xl bg-[var(--paper)] p-5 shadow-2xl sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--blue)]">รายการใหม่</p><h2 id="workload-create-title" className="mt-1 text-xl font-semibold">เพิ่มรายการ TOR</h2><p className="mt-1 text-sm text-[var(--muted)]">กำหนดหมวด รหัส หัวข้อ และน้ำหนักของงาน</p></div><button type="button" onClick={onCancel} className="focus-ring rounded-xl px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[#e9e8e2]">ปิด</button></div>
        <div className="mt-6 space-y-4">
          <div><label className="mb-2 block text-sm font-semibold" htmlFor="new-workload-category">หมวด TOR <span className="text-[var(--red)]">*</span></label><select id="new-workload-category" value={category} onChange={(event) => setCategory(event.target.value as WorkloadCategory)} className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 shadow-sm">{WORKLOAD_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></div>
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr]"><div><label className="mb-2 block text-sm font-semibold" htmlFor="new-workload-code">รหัส TOR <span className="text-[var(--red)]">*</span></label><input id="new-workload-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="เช่น 2.4" className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 shadow-sm" /></div><div><label className="mb-2 block text-sm font-semibold" htmlFor="new-workload-weight">น้ำหนัก (%) <span className="text-[var(--red)]">*</span></label><input id="new-workload-weight" type="number" min="0" max="100" step="0.01" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="0–100" className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 shadow-sm" /></div></div>
          <div><label className="mb-2 block text-sm font-semibold" htmlFor="new-workload-title">หัวข้อ TOR <span className="text-[var(--red)]">*</span></label><textarea id="new-workload-title" rows={3} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="ระบุชื่อภาระงาน" className="focus-ring w-full resize-y rounded-xl border border-[var(--line)] bg-white px-4 py-3 leading-6 shadow-sm" /></div>
        </div>
        {error ? <p role="alert" className="mt-4 rounded-xl bg-[#fff1f1] px-3.5 py-3 text-sm leading-6 text-[var(--red)]">{error}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} className="focus-ring rounded-xl px-4 py-3 text-sm font-semibold text-[var(--muted)] hover:bg-[#f0f0ed]">ยกเลิก</button><button type="submit" disabled={saving} className="focus-ring rounded-xl bg-[var(--blue)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(47,86,211,.22)] transition hover:bg-[#2548b5] disabled:cursor-not-allowed disabled:opacity-60">{saving ? "กำลังเพิ่ม…" : "เพิ่มรายการ TOR"}</button></div>
      </form>
    </div>
  );
}
