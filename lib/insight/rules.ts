import type { AreaKey } from "@/lib/areas";

// Insight Engine rule-based — thuần túy, minh bạch: mỗi gợi ý kèm căn cứ số liệu.
// Caller đảm bảo `weeks` là các tuần ISO LIÊN TIẾP đã kết thúc, CÓ dữ liệu
// (tuần trống không đưa vào), sắp theo thời gian tăng dần.

export type RuleKey = "r1_shortfall" | "r2_mismatch" | "r3_overload";

export interface InsightWeek {
  isoWeek: string;
  /** fulfillment 0..1.5 theo mảng (từ computeFulfillment). */
  fulfillment: Partial<Record<AreaKey, number>>;
  actualShare: Partial<Record<AreaKey, number>>;
  expectedShare: Partial<Record<AreaKey, number>>;
}

export interface Suggestion {
  areaKey: AreaKey;
  ruleKey: RuleKey;
  /** Mức lệch 0..1 để xếp hạng — lớn hơn = đáng chú ý hơn. */
  severity: number;
  evidence: string;
  suggestion: string;
}

const MAX_SUGGESTIONS = 3;
/** Ngưỡng R2: lệch ≥ 2 bậc (bậc = 20%) giữa tự chấm và fulfillment. */
const MISMATCH_GAP = 0.4;

const pct = (x: number) => Math.round(x * 100);

export function computeSuggestions({
  weeks,
  reviewScores,
  areaNames,
  areaKeys,
}: {
  weeks: InsightWeek[];
  /** Điểm tự chấm 1-10 của tuần kết thúc gần nhất (nếu có review). */
  reviewScores?: Partial<Record<AreaKey, number>>;
  areaNames: Record<AreaKey, string>;
  areaKeys: AreaKey[];
}): Suggestion[] {
  const result: Suggestion[] = [];
  const last = weeks[weeks.length - 1];
  const prev = weeks.length >= 2 ? weeks[weeks.length - 2] : undefined;

  for (const areaKey of areaKeys) {
    const name = areaNames[areaKey];

    // R1 — Hụt kéo dài: dưới 50% mức đủ 2 tuần liên tiếp
    if (prev && last) {
      const f1 = prev.fulfillment[areaKey];
      const f2 = last.fulfillment[areaKey];
      if (f1 !== undefined && f2 !== undefined && f1 < 0.5 && f2 < 0.5) {
        const avg = (f1 + f2) / 2;
        result.push({
          areaKey,
          ruleKey: "r1_shortfall",
          severity: (0.5 - avg) / 0.5,
          evidence: `${name} dưới 50% mức đủ 2 tuần liền (${prev.isoWeek}: ${pct(f1)}%, ${last.isoWeek}: ${pct(f2)}%).`,
          suggestion: `Tuần này ưu tiên ${name}: đặt một khung giờ cố định mỗi ngày, dù chỉ 30 phút.`,
        });
      }

      // R3 — Quá tải một mảng: chiếm hơn gấp đôi mức kỳ vọng 2 tuần liền
      const over = (week: InsightWeek) => {
        const actual = week.actualShare[areaKey];
        const expected = week.expectedShare[areaKey];
        return actual !== undefined && expected !== undefined && expected > 0
          ? actual / expected
          : 0;
      };
      const r1 = over(prev);
      const r2 = over(last);
      if (r1 > 2 && r2 > 2) {
        result.push({
          areaKey,
          ruleKey: "r3_overload",
          severity: Math.min((Math.min(r1, r2) - 2) / 2, 1),
          evidence: `${name} chiếm ${pct(last.actualShare[areaKey] ?? 0)}% tổng giờ — hơn gấp đôi mức kỳ vọng ${pct(last.expectedShare[areaKey] ?? 0)}%, 2 tuần liền.`,
          suggestion: `Tiết chế ${name}: chủ động cắt bớt và chuyển giờ sang mảng đang hụt.`,
        });
      }
    }

    // R2 — Lệch cảm nhận–hành vi trên tuần kết thúc gần nhất có review
    if (last && reviewScores) {
      const score = reviewScores[areaKey];
      const fulfillment = last.fulfillment[areaKey];
      if (score !== undefined && fulfillment !== undefined) {
        const feel = score / 10;
        const behavior = Math.min(fulfillment, 1);
        const gap = feel - behavior;
        if (Math.abs(gap) >= MISMATCH_GAP) {
          result.push({
            areaKey,
            ruleKey: "r2_mismatch",
            severity: Math.min(Math.abs(gap), 1),
            evidence:
              gap > 0
                ? `${name} ${last.isoWeek}: tự chấm ${score}/10 nhưng giờ thực tế chỉ đạt ${pct(fulfillment)}% mức đủ.`
                : `${name} ${last.isoWeek}: dành nhiều giờ (${pct(fulfillment)}% mức đủ) nhưng tự chấm chỉ ${score}/10.`,
            suggestion:
              gap > 0
                ? `Cảm nhận tốt về ${name} nhưng gần như không dành giờ — hoặc chấm lại cho thật, hoặc dành giờ thật.`
                : `Giờ cho ${name} đang không chất lượng? Thử đổi cách dùng giờ thay vì thêm giờ.`,
          });
        }
      }
    }
  }

  return result.sort((a, b) => b.severity - a.severity).slice(0, MAX_SUGGESTIONS);
}
