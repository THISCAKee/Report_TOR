export type WorkloadCategory =
  | "งานหลัก"
  | "งานรอง"
  | "งานทำนุบำรุงศิลปะและวัฒนธรรม"
  | "งานอื่น ๆ";

export type WorkloadDefinition = {
  id: string;
  category: WorkloadCategory;
  code: string;
  title: string;
  weight: number;
  targets: string[];
};

export type WorkloadEditDraft = Pick<WorkloadDefinition, "title" | "weight">;
export type WorkloadCreateDraft = Pick<WorkloadDefinition, "category" | "code" | "title" | "weight">;

export type EvaluationCycle = 1 | 2;

export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  width?: number;
  height?: number;
};

export type WorkLog = {
  id: string;
  date: string;
  workloadId: string;
  evaluationCycle: EvaluationCycle;
  notes: string;
  detail: string;
  quantity?: string;
  unit?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
};

export type WorkLogDraft = Pick<WorkLog, "date" | "workloadId" | "evaluationCycle" | "detail" | "notes" | "attachments"> & { quantity: string; unit: string; files?: File[] };
