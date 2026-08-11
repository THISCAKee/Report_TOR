import type { WorkloadCategory, WorkloadDefinition } from "@/lib/types";

const targets = [
  "ข้อเสนอโครงการผ่านและได้รับการอนุมัติ",
  "วางโครงสร้างกิจกรรม เนื้อหา และรูปแบบการนำเสนอ",
  "ดำเนินกิจกรรมตามแผน",
  "ประเมินผลการดำเนินงาน",
  "สรุปผลและรายงานต่อผู้บังคับบัญชา",
];

const item = (
  id: string,
  category: WorkloadCategory,
  code: string,
  title: string,
  weight: number,
  customTargets = targets,
): WorkloadDefinition => ({ id, category, code, title, weight, targets: customTargets });

export const WORKLOADS: WorkloadDefinition[] = [
  item("main-1-1", "งานหลัก", "1.1", "โครงการนิทรรศการศูนย์การเรียนรู้วัฒนธรรมเกาหลี", 10),
  item("main-1-2", "งานหลัก", "1.2", "งานบริหารลูกค้าสัมพันธ์", 10),
  item("main-1-3", "งานหลัก", "1.3", "งานผลิตสื่อเพื่อเผยแพร่บนแพลตฟอร์มออนไลน์", 10),
  item("main-1-4", "งานหลัก", "1.4", "งานออกแบบสื่อกราฟฟิก", 10),
  item("main-1-5", "งานหลัก", "1.5", "งานผลิตสื่อวิดีทัศน์", 10),
  item("main-1-6", "งานหลัก", "1.6", "บริการ AI Lab for Research Up-Skill", 10),
  item("main-1-7", "งานหลัก", "1.7", "บริการยืม - คืนทรัพยากรสารสนเทศ", 5),
  item("main-1-8", "งานหลัก", "1.8", "บริการทรัพยากรสารสนเทศสื่อโสตทัศน์และสื่อดิจิทัลสร้างสรรค์", 5),
  item("secondary-2-1", "งานรอง", "2.1", "โครงการ OPEN House", 5),
  item("secondary-2-2", "งานรอง", "2.2", "วิทยากร AI", 5),
  item("secondary-2-3", "งานรอง", "2.3", "การมาปฏิบัติราชการตรงตามเวลาราชการ", 5),
  item("culture-3-1", "งานทำนุบำรุงศิลปะและวัฒนธรรม", "3.1", "งานทำนุบำรุงศิลปะและวัฒนธรรม", 5),
  item("other-4-1", "งานอื่น ๆ", "4.1", "งานปฏิบัติตามคำสั่งบังคับบัญชา/คณะกรรมการ", 5),
  item("other-4-2", "งานอื่น ๆ", "4.2", "งานพัฒนาตนเอง", 5),
];

export const WORKLOAD_CATEGORIES: WorkloadCategory[] = [
  "งานหลัก",
  "งานรอง",
  "งานทำนุบำรุงศิลปะและวัฒนธรรม",
  "งานอื่น ๆ",
];

export function getWorkload(id: string) {
  return WORKLOADS.find((workload) => workload.id === id);
}
