import { WORKLOAD_CATEGORIES, WORKLOADS } from "@/lib/workload-data";

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function WorkloadSelect({ value, onChange, error }: Props) {
  const selected = WORKLOADS.find((workload) => workload.id === value);

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[var(--ink)]" htmlFor="workload">
        รายการภาระงาน <span className="text-[var(--red)]">*</span>
      </label>
      <select
        id="workload"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "workload-error" : "workload-help"}
        className="focus-ring w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[15px] text-[var(--ink)] shadow-sm transition hover:border-[#aeb6c8]"
      >
        <option value="">เลือกงานจากรายการ TOR</option>
        {WORKLOAD_CATEGORIES.map((category) => (
          <optgroup key={category} label={category}>
            {WORKLOADS.filter((workload) => workload.category === category).map((workload) => (
              <option key={workload.id} value={workload.id}>
                {workload.code} {workload.title} · น้ำหนัก {workload.weight}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {selected ? (
        <div className="mt-3 rounded-xl border border-[#e7d7ae] bg-[#fffaf0] px-3.5 py-3 text-sm leading-relaxed text-[#715720]">
          <div className="flex items-center justify-between gap-3 font-semibold">
            <span>เป้าหมายระดับ 1–5</span><span>{selected.weight}%</span>
          </div>
          <p className="mt-1 text-xs text-[#8b7442]">{selected.targets[0]} · {selected.targets[4]}</p>
        </div>
      ) : null}
      {error ? <p id="workload-error" className="mt-2 text-sm text-[var(--red)]">{error}</p> : <p id="workload-help" className="mt-2 text-xs text-[var(--muted)]">เลือกรายการที่ตรงกับงานที่กำลังดำเนินการ</p>}
    </div>
  );
}
