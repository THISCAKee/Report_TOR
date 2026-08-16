import type { WorkloadOccurrence } from "@/lib/work-log-insights";

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
const stringCell = (value: string) => `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
const numberCell = (value: number) => `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;

export function buildWorkloadStatisticsExcel(month: string, stats: WorkloadOccurrence[]): string {
  const rows = stats.map((stat) => `<Row>${stringCell(stat.code)}${stringCell(stat.title)}${numberCell(stat.count)}</Row>`).join("");
  const emptyRow = `<Row>${stringCell("ไม่มีข้อมูลในเดือนนี้")}${stringCell("")}${numberCell(0)}</Row>`;
  return `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="สถิติการทำงาน"><Table><Row><Cell ss:MergeAcross="2"><Data ss:Type="String">สถิติการทำงาน เดือน ${escapeXml(month)}</Data></Cell></Row><Row>${stringCell("รหัสงาน")}${stringCell("ชื่องาน")}${stringCell("จำนวนครั้ง")}</Row>${rows || emptyRow}</Table></Worksheet></Workbook>`;
}
