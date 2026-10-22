import type { AreaKey } from "@/lib/areas";

// Logic chuẩn hóa độ cân bằng — thuần túy, không phụ thuộc DB/React (unit-test được).

/** Trần fulfillment: vượt 150% mức "đủ" thì coi như 150% để wheel không méo. */
export const FULFILLMENT_CAP = 1.5;

export interface AreaFulfillment {
  areaKey: AreaKey;
  hours: number;
  /** Tỷ trọng kỳ vọng suy từ trọng số: weight / Σweights. */
  expectedShare: number;
  /** Tỷ trọng thực tế: hours / Σhours. */
  actualShare: number;
  /** actualShare / expectedShare, cap tại FULFILLMENT_CAP. 0 khi Σhours = 0. */
  fulfillment: number;
}

/**
 * Tính mức "đủ" từng mảng từ trọng số 1-5 và tổng giờ thực tế.
 * Tuần thiếu ngày vẫn tính được: chỉ dựa trên tổng giờ đã nhập.
 */
export function computeFulfillment(
  weights: Partial<Record<AreaKey, number>>,
  hoursByArea: Partial<Record<AreaKey, number>>,
  areaKeys: AreaKey[]
): AreaFulfillment[] {
  const totalWeight = areaKeys.reduce((sum, key) => sum + (weights[key] ?? 0), 0);
  const totalHours = areaKeys.reduce((sum, key) => sum + (hoursByArea[key] ?? 0), 0);

  return areaKeys.map((areaKey) => {
    const hours = hoursByArea[areaKey] ?? 0;
    const expectedShare = totalWeight > 0 ? (weights[areaKey] ?? 0) / totalWeight : 0;
    const actualShare = totalHours > 0 ? hours / totalHours : 0;
    const fulfillment =
      expectedShare > 0 && totalHours > 0
        ? Math.min(actualShare / expectedShare, FULFILLMENT_CAP)
        : 0;
    return { areaKey, hours, expectedShare, actualShare, fulfillment };
  });
}

/** "2026-W43" — tuần ISO 8601 (tuần bắt đầu thứ Hai, tuần 1 chứa thứ Năm đầu năm). */
export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayOfWeek = d.getUTCDay() || 7; // CN = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek); // dời tới thứ Năm cùng tuần
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Thứ Hai (00:00 local) của tuần chứa `date`. */
export function mondayOf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayOfWeek = d.getDay() || 7;
  d.setDate(d.getDate() - (dayOfWeek - 1));
  return d;
}

export interface DayEntry {
  date: string; // YYYY-MM-DD
  /** Có thể thiếu: ngày có hoạt động nhưng chưa chấm tâm trạng. */
  mood?: number;
  hoursByArea: Partial<Record<AreaKey, number>>;
}

export interface WeekAggregate {
  isoWeek: string;
  days: number;
  /** Số ngày có chấm tâm trạng — mẫu số của avgMood. */
  moodDays: number;
  totalHoursByArea: Partial<Record<AreaKey, number>>;
  avgMood: number;
}

/** Gộp check-in theo tuần ISO, sắp theo tuần tăng dần. */
export function aggregateByWeek(entries: DayEntry[]): WeekAggregate[] {
  const byWeek = new Map<string, WeekAggregate>();
  for (const entry of entries) {
    const week = isoWeekKey(new Date(`${entry.date}T00:00:00`));
    let agg = byWeek.get(week);
    if (!agg) {
      agg = { isoWeek: week, days: 0, moodDays: 0, totalHoursByArea: {}, avgMood: 0 };
      byWeek.set(week, agg);
    }
    // avgMood tích lũy dạng tổng, chia ở cuối theo số ngày có mood
    if (entry.mood !== undefined) {
      agg.avgMood += entry.mood;
      agg.moodDays += 1;
    }
    agg.days += 1;
    for (const [key, hours] of Object.entries(entry.hoursByArea)) {
      const areaKey = key as AreaKey;
      agg.totalHoursByArea[areaKey] = (agg.totalHoursByArea[areaKey] ?? 0) + (hours ?? 0);
    }
  }
  return [...byWeek.values()]
    .map((agg) => ({ ...agg, avgMood: agg.moodDays > 0 ? agg.avgMood / agg.moodDays : 0 }))
    .sort((a, b) => a.isoWeek.localeCompare(b.isoWeek));
}
