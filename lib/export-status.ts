export type WordExportStatus = "idle" | "preparing" | "building";

export function getWordExportStatusText(status: WordExportStatus): string {
  if (status === "preparing") return "กำลังรวมไฟล์แนบ…";
  if (status === "building") return "กำลังสร้างไฟล์ Word…";
  return "";
}
