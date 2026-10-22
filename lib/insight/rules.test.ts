import { describe, expect, it } from "vitest";
import { computeSuggestions, type InsightWeek } from "./rules";
import type { AreaKey } from "@/lib/areas";

const AREAS: AreaKey[] = ["health", "work", "leisure"];
const NAMES = {
  health: "Sức khỏe",
  work: "Công việc",
  leisure: "Giải trí",
} as Record<AreaKey, string>;

// Fixture: 2 tuần — health hụt nặng, work quá tải, leisure bình thường
const W1: InsightWeek = {
  isoWeek: "2026-W42",
  fulfillment: { health: 0.3, work: 1.5, leisure: 0.9 },
  actualShare: { health: 0.1, work: 0.75, leisure: 0.15 },
  expectedShare: { health: 0.33, work: 0.33, leisure: 0.33 },
};
const W2: InsightWeek = {
  isoWeek: "2026-W43",
  fulfillment: { health: 0.4, work: 1.5, leisure: 1.0 },
  actualShare: { health: 0.13, work: 0.7, leisure: 0.17 },
  expectedShare: { health: 0.33, work: 0.33, leisure: 0.33 },
};

function run(weeks: InsightWeek[], reviewScores?: Partial<Record<AreaKey, number>>) {
  return computeSuggestions({ weeks, reviewScores, areaNames: NAMES, areaKeys: AREAS });
}

describe("computeSuggestions", () => {
  it("R1: hụt < 50% hai tuần liền → gợi ý kèm số liệu cả 2 tuần", () => {
    const r1 = run([W1, W2]).find((s) => s.ruleKey === "r1_shortfall");
    expect(r1?.areaKey).toBe("health");
    expect(r1?.evidence).toContain("2026-W42: 30%");
    expect(r1?.evidence).toContain("2026-W43: 40%");
  });

  it("R1 không kích hoạt khi chỉ hụt 1 tuần", () => {
    const okWeek: InsightWeek = { ...W1, fulfillment: { ...W1.fulfillment, health: 0.8 } };
    const r1 = run([okWeek, W2]).find((s) => s.ruleKey === "r1_shortfall");
    expect(r1).toBeUndefined();
  });

  it("R3: chiếm hơn gấp đôi kỳ vọng 2 tuần liền → gợi ý tiết chế", () => {
    const r3 = run([W1, W2]).find((s) => s.ruleKey === "r3_overload");
    expect(r3?.areaKey).toBe("work");
    expect(r3?.suggestion).toContain("Tiết chế");
  });

  it("R2: tự chấm cao nhưng fulfillment thấp → cảnh báo lệch đúng chiều", () => {
    const r2 = run([W2], { health: 9 }).find((s) => s.ruleKey === "r2_mismatch");
    expect(r2?.areaKey).toBe("health");
    expect(r2?.evidence).toContain("tự chấm 9/10");
  });

  it("R2 chiều ngược: giờ nhiều nhưng tự chấm thấp", () => {
    const r2 = run([W2], { work: 3 }).find((s) => s.ruleKey === "r2_mismatch");
    expect(r2?.areaKey).toBe("work");
    expect(r2?.evidence).toContain("tự chấm chỉ 3/10");
  });

  it("R2 không kích hoạt khi lệch dưới 2 bậc", () => {
    const r2 = run([W2], { leisure: 8 }).find((s) => s.ruleKey === "r2_mismatch");
    expect(r2).toBeUndefined(); // 0.8 vs min(1.0, 1) = gap 0.2 < 0.4
  });

  it("không dữ liệu / 1 tuần không review → không gợi ý", () => {
    expect(run([])).toEqual([]);
    expect(run([W2])).toEqual([]);
  });

  it("tối đa 3 gợi ý, xếp theo severity giảm dần", () => {
    const all = run([W1, W2], { health: 9, work: 3, leisure: 5 });
    expect(all.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].severity).toBeGreaterThanOrEqual(all[i].severity);
    }
  });
});
