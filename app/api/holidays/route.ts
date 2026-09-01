import { NextResponse } from "next/server";
import { getThaiPublicHolidays, indexHolidaysByDate } from "@/lib/thai-holidays";

export const revalidate = 86400;

export function GET(request: Request) {
  const year = Number(new URL(request.url).searchParams.get("year"));
  if (!Number.isInteger(year) || year < 1970 || year > 2100) return NextResponse.json({ error: "ปีไม่ถูกต้อง" }, { status: 400 });
  return NextResponse.json(indexHolidaysByDate(getThaiPublicHolidays(year)));
}
