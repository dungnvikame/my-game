import { ymdLocal } from "./today";

// Cửa sổ check-in dùng chung cho UI và server action: hôm nay hoặc tối đa 30 ngày trước.
export const CHECKIN_WINDOW_DAYS = 30;

export function isValidCheckinDate(date: string, today: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const min = new Date(`${today}T00:00:00`);
  min.setDate(min.getDate() - CHECKIN_WINDOW_DAYS);
  return date <= today && date >= ymdLocal(min);
}

/** Param không hợp lệ/ngoài cửa sổ → về hôm nay. */
export function resolveCheckinDate(param: string | undefined, today: string): string {
  return param && isValidCheckinDate(param, today) ? param : today;
}
