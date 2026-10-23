import type { AreaKey } from "@/lib/areas";

// Nhận định ban đầu rule-based từ (trọng số 1-5, mức hài lòng 1-10) —
// thuần túy, minh bạch, mỗi kết luận suy thẳng từ 2 con số người dùng tự khai.

export interface AreaReading {
  areaKey: AreaKey;
  weight: number; // 1-5
  score: number; // 1-10
}

export interface Assessment {
  /** Câu tổng quan theo điểm hài lòng trung bình có trọng số. */
  summary: string;
  avgScore: number;
  /** Coi trọng (≥4) nhưng chưa ổn (≤5) — nơi cần hành động trước. */
  hotspots: AreaReading[];
  /** Coi trọng và đang ổn (≥7) — giữ nhịp. */
  strengths: AreaReading[];
  /** Cả ưu tiên lẫn hài lòng đều thấp — đáng tự hỏi có thật sự không quan trọng. */
  blindspots: AreaReading[];
}

export function computeAssessment(
  weights: Partial<Record<AreaKey, number>>,
  baseline: Partial<Record<AreaKey, number>>,
  areaKeys: AreaKey[]
): Assessment {
  const readings: AreaReading[] = areaKeys.map((areaKey) => ({
    areaKey,
    weight: weights[areaKey] ?? 3,
    score: baseline[areaKey] ?? 5,
  }));

  // Trung bình có trọng số: mảng càng quan trọng càng ảnh hưởng cảm nhận chung
  const totalWeight = readings.reduce((sum, r) => sum + r.weight, 0);
  const avgScore =
    totalWeight > 0
      ? readings.reduce((sum, r) => sum + r.score * r.weight, 0) / totalWeight
      : 0;

  const hotspots = readings
    .filter((r) => r.weight >= 4 && r.score <= 5)
    .sort((a, b) => b.weight - a.weight || a.score - b.score);
  const strengths = readings
    .filter((r) => r.weight >= 4 && r.score >= 7)
    .sort((a, b) => b.score - a.score);
  const blindspots = readings
    .filter((r) => r.weight <= 2 && r.score <= 4)
    .sort((a, b) => a.score - b.score);

  let summary: string;
  if (avgScore >= 7.5) {
    summary =
      "Nhìn chung bạn đang hài lòng với cuộc sống ở những mảng mình coi trọng. Việc chính là giữ nhịp và để dữ liệu xác nhận cảm nhận đó.";
  } else if (avgScore >= 5.5) {
    summary =
      "Cuộc sống của bạn ở mức tạm ổn nhưng có chỗ lệch: vài mảng bạn coi trọng chưa được như mong muốn. Dồn hành động vào đúng các điểm nóng bên dưới.";
  } else {
    summary =
      "Các mảng bạn coi trọng đang ở mức thấp — giai đoạn này đáng để sắp xếp lại. Bắt đầu nhỏ: mỗi ngày một hành động cho điểm nóng số 1.";
  }

  return { summary, avgScore, hotspots, strengths, blindspots };
}
