import Holidays from "date-holidays";

export type ThaiHoliday = {
  date: string;
  name: string;
};

const SPECIAL_HOLIDAYS: Record<number, ThaiHoliday[]> = {
  2026: [{ date: "2026-01-02", name: "วันหยุดพิเศษช่วงเทศกาลปีใหม่" }],
};

const addDays = (dateString: string, days: number) => {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const isWeekend = (dateString: string) => {
  const day = new Date(`${dateString}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
};

export function getThaiPublicHolidays(year: number): ThaiHoliday[] {
  const calendar = new Holidays("TH");
  calendar.setLanguages("th");
  const holidays = calendar.getHolidays(year)
    .filter((holiday) => holiday.type === "public")
    .map((holiday) => ({ date: holiday.date.slice(0, 10), name: holiday.name }));
  const baseHolidays = [...holidays, ...(SPECIAL_HOLIDAYS[year] ?? [])];
  const occupied = new Set(baseHolidays.map((holiday) => holiday.date));
  const substitutions: ThaiHoliday[] = [];

  for (const holiday of baseHolidays) {
    if (!isWeekend(holiday.date)) continue;
    let substituteDate = addDays(holiday.date, 1);
    while (isWeekend(substituteDate) || occupied.has(substituteDate)) substituteDate = addDays(substituteDate, 1);
    occupied.add(substituteDate);
    substitutions.push({ date: substituteDate, name: `วันหยุดชดเชย (${holiday.name})` });
  }

  return [...baseHolidays, ...substitutions].sort((left, right) => left.date.localeCompare(right.date));
}

export function indexHolidaysByDate(holidays: ThaiHoliday[]): Record<string, string[]> {
  return holidays.reduce<Record<string, string[]>>((index, holiday) => {
    index[holiday.date] = [...(index[holiday.date] ?? []), holiday.name];
    return index;
  }, {});
}
