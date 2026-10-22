import { isoWeekKey, mondayOf } from "./score";

// Quy ước weekly review: làm vào Chủ nhật của tuần, hoặc làm bù
// trong 3 ngày đầu tuần sau (thứ Hai → thứ Tư).

export interface ReviewWindow {
  /** Tuần ISO đang là mục tiêu review. */
  targetWeek: string;
  /** true khi target là tuần trước (đang trong cửa sổ làm bù). */
  isMakeup: boolean;
  /** Thứ Hai của targetWeek — để truy vấn giờ thực tế của tuần đó. */
  targetMonday: Date;
}

export function currentWeekKey(today: Date): string {
  return isoWeekKey(today);
}

export function previousWeekKey(today: Date): string {
  const prev = mondayOf(today);
  prev.setDate(prev.getDate() - 7);
  return isoWeekKey(prev);
}

/**
 * Chọn tuần mục tiêu: thứ Hai → thứ Tư mà tuần trước chưa review thì
 * làm bù tuần trước; còn lại review tuần hiện tại.
 */
export function resolveReviewWindow(today: Date, reviewedWeeks: Set<string>): ReviewWindow {
  const dayOfWeek = today.getDay(); // 0 = CN
  const prevWeek = previousWeekKey(today);

  if (dayOfWeek >= 1 && dayOfWeek <= 3 && !reviewedWeeks.has(prevWeek)) {
    const prevMonday = mondayOf(today);
    prevMonday.setDate(prevMonday.getDate() - 7);
    return { targetWeek: prevWeek, isMakeup: true, targetMonday: prevMonday };
  }
  return {
    targetWeek: currentWeekKey(today),
    isMakeup: false,
    targetMonday: mondayOf(today),
  };
}

/** Có nên nhắc review không: CN chưa review tuần này, hoặc T2-T4 chưa review tuần trước. */
export function shouldRemindReview(today: Date, reviewedWeeks: Set<string>): boolean {
  const dayOfWeek = today.getDay();
  if (dayOfWeek === 0) return !reviewedWeeks.has(currentWeekKey(today));
  if (dayOfWeek >= 1 && dayOfWeek <= 3) return !reviewedWeeks.has(previousWeekKey(today));
  return false;
}
