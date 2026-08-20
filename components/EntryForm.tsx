"use client";

import { useEffect, useRef, useState } from "react";
import { formatFileSize, getTodayIso, isImageAttachment, removeAttachment } from "@/lib/format";
import type { Attachment, WorkLog, WorkLogDraft } from "@/lib/types";
import { getWorkload } from "@/lib/workload-data";

const MAX_BYTES = 10 * 1024 * 1024;
type PendingFile = { attachmentId: string; file: File };

type Props = {
  selectedDate: string;
  selectedWorkloadId?: string;
  initialLog?: WorkLog;
  onSave: (draft: WorkLogDraft) => void;
  onCancel: () => void;
};

const fileToAttachment = (file: File): Promise<Attachment> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = String(reader.result);
    const base = { id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`, name: file.name, size: file.size, type: file.type, dataUrl };
    if (!file.type.startsWith("image/")) return resolve(base);
    const image = new Image();
    image.onload = () => resolve({ ...base, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(base);
    image.src = dataUrl;
  };
  reader.onerror = () => reject(new Error(`อ่านไฟล์ ${file.name} ไม่สำเร็จ`));
  reader.readAsDataURL(file);
});

export function EntryForm({ selectedDate, selectedWorkloadId, initialLog, onSave, onCancel }: Props) {
  const [date, setDate] = useState(initialLog?.date ?? selectedDate ?? getTodayIso());
  const [workloadId, setWorkloadId] = useState(initialLog?.workloadId ?? selectedWorkloadId ?? "");
  const [detail, setDetail] = useState(initialLog?.detail ?? "");
  const [notes, setNotes] = useState(initialLog?.notes ?? "");
  const [quantity, setQuantity] = useState(initialLog?.quantity ?? "1");
  const [unit, setUnit] = useState(initialLog?.unit ?? "รายการ");
  const [attachments, setAttachments] = useState<Attachment[]>(initialLog?.attachments ?? []);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedWorkload = getWorkload(workloadId);

  useEffect(() => {
    setDate(initialLog?.date ?? selectedDate ?? getTodayIso());
    setWorkloadId(initialLog?.workloadId ?? selectedWorkloadId ?? "");
    setDetail(initialLog?.detail ?? "");
    setNotes(initialLog?.notes ?? "");
    setQuantity(initialLog?.quantity ?? "1");
    setUnit(initialLog?.unit ?? "รายการ");
    setAttachments(initialLog?.attachments ?? []);
    setPendingFiles([]);
    setError("");
  }, [initialLog, selectedDate, selectedWorkloadId]);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const picked = Array.from(files);
    if (attachments.reduce((sum, file) => sum + file.size, 0) + picked.reduce((sum, file) => sum + file.size, 0) > MAX_BYTES) {
      setError("ไฟล์แนบรวมกันต้องมีขนาดไม่เกิน 10 MB");
      return;
    }
    setReading(true);
    setError("");
    try {
      const next = await Promise.all(picked.map(fileToAttachment));
      setAttachments((current) => [...current, ...next]);
      setPendingFiles((current) => [...current, ...next.map((attachment, index) => ({ attachmentId: attachment.id, file: picked[index] }))]);
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : "ไม่สามารถอ่านไฟล์ได้");
    } finally {
      setReading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!date) return setError("กรุณาเลือกวันที่");
    if (!workloadId) return setError("กรุณาเลือกรายการภาระงาน");
    if (!detail.trim()) return setError("กรุณาเขียนรายละเอียดการทำงาน");
    setError("");
    onSave({ date, workloadId, detail: detail.trim(), notes: notes.trim(), quantity: quantity || "1", unit, attachments, files: pendingFiles.map((pending) => pending.file) });
    if (initialLog) return;
    setWorkloadId(""); setDetail(""); setNotes(""); setQuantity("1"); setUnit("รายการ"); setAttachments([]); setPendingFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--blue)]">{initialLog ? "แก้ไขรายการ" : "บันทึกใหม่"}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">รายละเอียดภาระงาน</h2>
        </div>
        <span className="rounded-full bg-[#edf1ff] px-3 py-1 text-xs font-semibold text-[var(--blue)]">บันทึกบนระบบ</span>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="date">วันที่ทำงาน <span className="text-[var(--red)]">*</span></label>
        <input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 shadow-sm transition hover:border-[#aeb6c8]" />
      </div>

      <div className="rounded-xl border border-[#d8def1] bg-[#f4f6ff] px-4 py-3.5">
        <p className="text-xs font-semibold text-[var(--muted)]">รายการภาระงานที่เลือก</p>
        <p className="mt-1 font-semibold leading-6 text-[var(--ink)]">{selectedWorkload ? `${selectedWorkload.code} ${selectedWorkload.title}` : "ยังไม่ได้เลือกรายการ"}</p>
        {selectedWorkload ? <p className="mt-1 text-xs text-[var(--muted)]">หมวด{selectedWorkload.category} · น้ำหนัก {selectedWorkload.weight}%</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="detail">รายละเอียดการทำงาน <span className="text-[var(--red)]">*</span></label>
        <textarea id="detail" rows={6} value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="เขียนสิ่งที่ดำเนินการ ผลลัพธ์ หรือประเด็นที่ต้องติดตาม..." className="focus-ring w-full resize-y rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[15px] leading-7 shadow-sm placeholder:text-[#a5abb7] transition hover:border-[#aeb6c8]" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold" htmlFor="notes">หมายเหตุ</label>
        <textarea id="notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="บันทึกหมายเหตุหรือสิ่งที่ต้องติดตามเพิ่มเติม..." className="focus-ring w-full resize-y rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[15px] leading-7 shadow-sm placeholder:text-[#a5abb7] transition hover:border-[#aeb6c8]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-2 block text-sm font-semibold" htmlFor="quantity">จำนวน</label><input id="quantity" type="number" min="0" step="0.5" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 shadow-sm" /></div>
        <div><label className="mb-2 block text-sm font-semibold" htmlFor="unit">หน่วยนับ</label><select id="unit" value={unit} onChange={(event) => setUnit(event.target.value)} className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 shadow-sm"><option>รายการ</option><option>ครั้ง</option><option>ชม.</option><option>ชั่วโมง</option><option>วัน</option></select></div>
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between gap-3">
          <label className="block text-sm font-semibold" htmlFor="attachments">ไฟล์งานแนบ</label>
          <span className="text-xs text-[var(--muted)]">รวมไม่เกิน 10 MB</span>
        </div>
        <label htmlFor="attachments" className="focus-ring flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#b9c2d5] bg-[#fafbfe] px-4 py-4 text-center transition hover:border-[var(--blue)] hover:bg-[#f4f6ff]">
          <span className="text-xl text-[var(--blue)]">＋</span>
          <span className="mt-1 text-sm font-semibold text-[var(--ink)]">คลิกเพื่อเลือกไฟล์หลายรายการ</span>
          <span className="mt-0.5 text-xs text-[var(--muted)]">รองรับทุกนามสกุลไฟล์</span>
          <input ref={fileInputRef} id="attachments" type="file" multiple onChange={(event) => void handleFiles(event.target.files)} className="sr-only" />
        </label>
        {reading ? <p className="mt-2 text-sm text-[var(--blue)]">กำลังเตรียมไฟล์แนบ…</p> : null}
        {attachments.length ? <ul className="mt-3 space-y-2">{attachments.map((file) => <li key={file.id} className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm">{isImageAttachment(file.type) ? <img src={file.dataUrl} alt={`ตัวอย่าง ${file.name}`} className="size-12 shrink-0 rounded-lg border border-[var(--line)] object-cover" /> : <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-[#eef1fb] text-xs font-bold text-[var(--blue)]">FILE</span>}<span className="min-w-0 flex-1 truncate" title={file.name}>{file.name}<small className="ml-2 text-xs text-[var(--muted)]">{formatFileSize(file.size)}</small></span><button type="button" onClick={() => { setAttachments((current) => removeAttachment(current, file)); setPendingFiles((current) => current.filter((item) => item.attachmentId !== file.id)); }} className="focus-ring rounded-lg px-2 py-1 text-xs font-semibold text-[var(--red)] hover:bg-[#fff1f1]">ลบ</button></li>)}</ul> : null}
      </div>

      {error ? <p role="alert" className="rounded-xl bg-[#fff1f1] px-3.5 py-3 text-sm leading-6 text-[var(--red)]">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        {initialLog ? <button type="button" onClick={onCancel} className="focus-ring rounded-xl px-4 py-3 text-sm font-semibold text-[var(--muted)] hover:bg-[#f0f0ed]">ยกเลิก</button> : null}
        <button type="submit" disabled={reading} className="focus-ring rounded-xl bg-[var(--blue)] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(47,86,211,.22)] transition hover:-translate-y-0.5 hover:bg-[#2548b5] disabled:cursor-not-allowed disabled:opacity-60">{initialLog ? "บันทึกการแก้ไข" : "บันทึกภาระงาน"}</button>
      </div>
    </form>
  );
}
