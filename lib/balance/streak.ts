import { ymdLocal } from "./today";

/**
 * Chuỗi ngày check-in liên tiếp, đếm lùi từ hôm nay.
 * Hôm nay chưa check-in thì vẫn giữ chuỗi kết thúc hôm qua (chưa đứt).
 */
export function checkinStreak(checkinDates: Iterable<string>, todayYmd: string): number {
  const dates = new Set(checkinDates);
  const cursor = new Date(`${todayYmd}T00:00:00`);
  if (!dates.has(todayYmd)) cursor.setDate(cursor.getDate() - 1); // bắt đầu từ hôm qua

  let streak = 0;
  while (dates.has(ymdLocal(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
