export type WordExportStatus = "idle" | "preparing" | "compressing" | "building" | "downloading";

export function getWordExportStatusText(status: WordExportStatus): string {
  if (status === "preparing") return "กำลังรวมไฟล์แนบ…";
  if (status === "compressing") return "กำลังย่อรูปภาพ…";
  if (status === "building") return "กำลังสร้างไฟล์ Word…";
  if (status === "downloading") return "กำลังดาวน์โหลด…";
  return "";
}
