import { describe, expect, it } from "vitest";
import { computeAssessment } from "./assessment";
import type { AreaKey } from "@/lib/areas";

const AREAS: AreaKey[] = ["health", "work", "leisure", "finance"];

describe("computeAssessment", () => {
  it("điểm nóng: coi trọng (≥4) nhưng hài lòng thấp (≤5), xếp weight rồi score", () => {
    const result = computeAssessment(
      { health: 5, work: 4, leisure: 2, finance: 4 },
      { health: 3, work: 5, leisure: 8, finance: 2 },
      AREAS
    );
    expect(result.hotspots.map((r) => r.areaKey)).toEqual(["health", "finance", "work"]);
  });

  it("đang ổn: coi trọng và score ≥ 7", () => {
    const result = computeAssessment(
      { health: 5, work: 4, leisure: 2, finance: 3 },
      { health: 8, work: 9, leisure: 8, finance: 5 },
      AREAS
    );
    expect(result.strengths.map((r) => r.areaKey)).toEqual(["work", "health"]);
  });

  it("điểm mù: cả weight ≤ 2 lẫn score ≤ 4", () => {
    const result = computeAssessment(
      { health: 4, work: 4, leisure: 1, finance: 2 },
      { health: 7, work: 7, leisure: 3, finance: 4 },
      AREAS
    );
    expect(result.blindspots.map((r) => r.areaKey)).toEqual(["leisure", "finance"]);
  });

  it("avgScore có trọng số: mảng quan trọng kéo điểm mạnh hơn", () => {
    // health w5 s2, leisure w1 s10 → (5*2 + 1*10)/6 ≈ 3.33 (không phải 6 như trung bình thường)
    const result = computeAssessment(
      { health: 5, leisure: 1 },
      { health: 2, leisure: 10 },
      ["health", "leisure"]
    );
    expect(result.avgScore).toBeCloseTo(20 / 6);
  });

  it("thiếu dữ liệu → mặc định weight 3, score 5, vẫn ra summary", () => {
    const result = computeAssessment({}, {}, AREAS);
    expect(result.avgScore).toBe(5);
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.hotspots).toEqual([]);
  });

  it("ba mức summary theo avgScore", () => {
    const low = computeAssessment({ health: 5 }, { health: 2 }, ["health"]);
    const mid = computeAssessment({ health: 5 }, { health: 6 }, ["health"]);
    const high = computeAssessment({ health: 5 }, { health: 9 }, ["health"]);
    expect(low.summary).toContain("sắp xếp lại");
    expect(mid.summary).toContain("tạm ổn");
    expect(high.summary).toContain("hài lòng");
  });
});
