import { formatFileSize, formatThaiDate, isImageAttachment } from "@/lib/format";
import { calculateCompressedImageDimensions } from "@/lib/image-compression";
import { countWorkloadOccurrencesIncludingZero } from "@/lib/work-log-insights";
import type { Attachment, WorkLog, WorkloadDefinition } from "@/lib/types";
import { getWorkCycle } from "@/lib/work-cycles";

const MAX_WORD_IMAGE_PX = 212;

export function calculateWordImageSize(originalWidth: number, originalHeight: number) {
  const scaledWidth = Math.max(1, originalWidth * 0.7);
  const scaledHeight = Math.max(1, originalHeight * 0.7);
  const fit = Math.min(1, MAX_WORD_IMAGE_PX / scaledWidth, MAX_WORD_IMAGE_PX / scaledHeight);
  return { width: Math.max(1, Math.round(scaledWidth * fit)), height: Math.max(1, Math.round(scaledHeight * fit)) };
}

const readImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => new Promise((resolve) => {
  const image = new Image();
  image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
  image.onerror = () => resolve({ width: 800, height: 600 });
  image.src = dataUrl;
});

const loadImage = (source: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("โหลดรูปภาพสำหรับส่งออกไม่สำเร็จ"));
  image.src = source;
});

const toEmbeddedDataUrl = async (source: string) => {
  if (!source || source.startsWith("data:")) return source;
  try {
    const response = await fetch(source);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
  } catch { return source; }
};

const getDataUrlByteSize = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil(base64.length * 3 / 4);
};

const compressWordImage = async (file: Attachment): Promise<Attachment> => {
  const dataUrl = await toEmbeddedDataUrl(file.dataUrl);
  const image = await loadImage(dataUrl);
  const dimensions = calculateCompressedImageDimensions(file.width ?? image.naturalWidth, file.height ?? image.naturalHeight);
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("สร้างพื้นที่ย่อรูปภาพไม่สำเร็จ");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, dimensions.width, dimensions.height);
  context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
  const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.65);
  const compressedSize = getDataUrlByteSize(compressedDataUrl);
  if (compressedSize >= file.size) return { ...file, dataUrl, width: dimensions.width, height: dimensions.height };
  return { ...file, dataUrl: compressedDataUrl, type: "image/jpeg", size: compressedSize, width: dimensions.width, height: dimensions.height };
};

export async function ensureWordImageDimensions(logs: WorkLog[]): Promise<WorkLog[]> {
  return Promise.all(logs.map(async (log) => ({
    ...log,
    attachments: await Promise.all(log.attachments.map(async (file) => {
      if (!isImageAttachment(file.type)) return file;
      try { return await compressWordImage(file); } catch {
        const dataUrl = await toEmbeddedDataUrl(file.dataUrl);
        if (file.width && file.height) return { ...file, dataUrl };
        return { ...file, dataUrl, ...(await readImageDimensions(dataUrl)) };
      }
    })),
  })));
}

export function escapeWordHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

const shortThaiDate = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  const buddhistYear = parsed.getFullYear() + 543;
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${parsed.getDate()} ${months[parsed.getMonth()]} ${String(buddhistYear).slice(-2)}`;
};

const monthTitle = (date: string) => {
  const parsed = new Date(`${date.slice(0, 7)}-01T00:00:00`);
  const months = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  return `${months[parsed.getMonth()]} พ.ศ. ${parsed.getFullYear() + 543}`;
};

const buildTabularWordDocument = (heading: string, logs: WorkLog[], workloads: WorkloadDefinition[], footerHtml = ""): string => {
  const sortedLogs = [...logs].sort((a, b) => `${a.date}-${a.createdAt}`.localeCompare(`${b.date}-${b.createdAt}`));
  const rows = sortedLogs.map((log) => {
    const workload = workloads.find((item) => item.id === log.workloadId);
    if (!workload) return "";
    const evidence = log.attachments.map((file) => {
      if (!isImageAttachment(file.type)) return `<div class="evidence">ไฟล์แนบ<br/><small>${formatFileSize(file.size)}</small></div>`;
      const size = calculateWordImageSize(file.width ?? 800, file.height ?? 600);
      return `<div class="evidence"><img src="${file.dataUrl}" alt="ภาพหลักฐาน" width="${size.width}" height="${size.height}" style="width:${size.width}px;height:${size.height}px"/></div>`;
    }).join("");
    const activity = `<strong>${escapeWordHtml(workload.code)} ${escapeWordHtml(workload.title)}</strong><br/>${escapeWordHtml(log.detail).replace(/\n/g, "<br/>")}`;
    return `<tr><td>${shortThaiDate(log.date)}</td><td>${activity}</td><td class="center">${escapeWordHtml(log.quantity ?? "1")}</td><td class="center">${escapeWordHtml(log.unit ?? "รายการ")}</td><td>${evidence || ""}</td><td>${escapeWordHtml(log.notes ?? "").replace(/\n/g, "<br/>")}</td></tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escapeWordHtml(heading)}</title><style>@page{size:A4 landscape;margin:12mm 10mm}body{font-family:Anuphan,Arial,sans-serif;color:#17233f;margin:20px;line-height:1.45}h1{text-align:center;font-size:20px;margin:0 0 5px}h2{font-size:16px;margin:22px 0 8px}p.meta{text-align:center;font-size:12px;margin:2px;color:#404b5f}.person{margin:18px 0 10px;font-size:12px;line-height:1.7}.report,.summary-table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:11px}.summary-table{margin-top:8px;page-break-inside:avoid}.summary-table th:nth-child(1){width:20%}.summary-table th:nth-child(2){width:65%}.summary-table th:nth-child(3){width:15%}thead{display:table-header-group}tr{page-break-inside:avoid}th,td{border:1px solid #333;padding:6px 7px;vertical-align:top;word-wrap:break-word}th{background:#e7e7e7;text-align:center;font-weight:bold}th:nth-child(1){width:7%}th:nth-child(2){width:19%}th:nth-child(3){width:6%}th:nth-child(4){width:8%}th:nth-child(5){width:50%}th:nth-child(6){width:10%}.center{text-align:center}.evidence{text-align:center;margin-bottom:5px}.evidence img{display:block;width:5.6cm;max-width:5.6cm;max-height:5.6cm;height:auto;object-fit:contain;margin:0 auto 3px}.evidence small{color:#586274}</style></head><body><h1>${escapeWordHtml(heading)}</h1><p class="meta">ผู้ปฏิบัติงาน นางสาวธารหทัย สุหญ้านาง &nbsp;&nbsp; ตำแหน่ง/ระดับ นักวิชาการศึกษาปฏิบัติการ</p><p class="meta">สังกัด กลุ่มงานบริการสารสนเทศและส่งเสริมการใช้บริการ</p><div class="person">จำนวนรายการบันทึกทั้งหมด: ${sortedLogs.length} รายการ</div><table class="report"><thead><tr><th>ว/ด/ป</th><th>งานที่ปฏิบัติ</th><th>จำนวน</th><th>หน่วยนับ<br/>(ชม./รายการ/<br/>ชื่อเรื่อง/ครั้ง)</th><th>หลักฐาน</th><th>ปัญหา/ แนวทางแก้ไข</th></tr></thead><tbody>${rows || "<tr><td colspan=\"6\">ไม่มีรายการบันทึก</td></tr>"}</tbody></table>${footerHtml}</body></html>`;
};

const buildWorkloadSummary = (logs: WorkLog[], workloads: WorkloadDefinition[]) => {
  const stats = countWorkloadOccurrencesIncludingZero(logs, workloads);
  const rows = stats.map((stat) => `<tr><td>${escapeWordHtml(stat.code)}</td><td>${escapeWordHtml(stat.title)}</td><td class="center">${stat.count} ครั้ง</td></tr>`).join("");
  return `<section class="workload-summary"><h2>สรุปจำนวนครั้งตามงาน</h2><table class="summary-table"><thead><tr><th>รหัสงาน</th><th>งานที่ปฏิบัติ</th><th>จำนวนครั้ง</th></tr></thead><tbody>${rows || "<tr><td colspan=\"3\">ไม่มีรายการงาน</td></tr>"}</tbody></table></section>`;
};

export function buildWordDocument(date: string, logs: WorkLog[], workloads: WorkloadDefinition[]): string {
  return buildTabularWordDocument(`บันทึกประจำวันการปฏิบัติงาน เดือน ${monthTitle(date)}`, logs, workloads);
}

export function buildWorkCycleWordDocument(startDate: string, endDate: string, logs: WorkLog[], workloads: WorkloadDefinition[]): string {
  const cycle = getWorkCycle(startDate);
  const heading = `รายงานการปฏิบัติงาน ${cycle.label} (${shortThaiDate(startDate)} ถึง ${shortThaiDate(endDate)})`;
  return buildTabularWordDocument(heading, logs, workloads, buildWorkloadSummary(logs, workloads));
}

export function buildMonthlyWorkloadWordDocument(date: string, logs: WorkLog[], workload: WorkloadDefinition): string {
  const sortedLogs = [...logs].sort((a, b) => `${a.date}-${a.createdAt}`.localeCompare(`${b.date}-${b.createdAt}`));
  const entries = sortedLogs.map((log, index) => {
    const images = log.attachments.filter((file) => isImageAttachment(file.type)).map((file) => {
      const size = calculateWordImageSize(file.width ?? 800, file.height ?? 600);
      return `<div class="image-wrap"><img src="${file.dataUrl}" alt="${escapeWordHtml(file.name)}" width="${size.width}" height="${size.height}" style="width:${size.width}px;height:${size.height}px"/><p class="caption">${escapeWordHtml(file.name)}</p></div>`;
    }).join("");
    return `<section class="entry"><h3>ครั้งที่ ${index + 1}</h3><p class="date">วันที่ ${shortThaiDate(log.date)}</p><p class="detail">${escapeWordHtml(log.detail).replace(/\n/g, "<br/>")}</p>${images || "<p class=\"empty\">ไม่มีรูปภาพแนบ</p>"}</section>`;
  }).join("");
  const workloadTitle = `${escapeWordHtml(workload.code)} ${escapeWordHtml(workload.title)}`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${workloadTitle} ${escapeWordHtml(monthTitle(date))}</title><style>@page{size:A4 portrait;margin:15mm}body{font-family:Anuphan,Arial,sans-serif;color:#17233f;margin:20px;line-height:1.5}h1{text-align:center;font-size:20px;margin:0 0 6px}h2{text-align:center;font-size:17px;margin:0 0 8px}.summary{text-align:center;font-size:13px;font-weight:bold;margin:0 0 22px}.entry{page-break-inside:avoid;margin:0 0 24px;padding:0 0 18px;border-bottom:1px solid #cfd4df}.entry h3{font-size:15px;margin:0 0 3px}.date,.caption,.empty{font-size:11px;color:#586274;margin:0 0 8px}.detail{font-size:12px;margin:0 0 12px}.image-wrap{text-align:center;margin:10px 0 14px}.image-wrap img{display:block;max-width:100%;height:auto;object-fit:contain;margin:0 auto 3px}.caption{margin:0}.empty{font-style:italic}</style></head><body><h1>รายงานประจำเดือน ${escapeWordHtml(monthTitle(date))}</h1><h2>${workloadTitle}</h2><p class="summary">เดือนนี้ดำเนินการแล้ว ${sortedLogs.length} ครั้ง</p>${entries || "<p class=\"empty\">ไม่มีรายการบันทึกในเดือนนี้</p>"}</body></html>`;
}
