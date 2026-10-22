import { describe, expect, it } from "vitest";
import {
  aggregateByWeek,
  computeFulfillment,
  FULFILLMENT_CAP,
  isoWeekKey,
  mondayOf,
} from "./score";
import type { AreaKey } from "@/lib/areas";

const AREAS: AreaKey[] = ["health", "work", "leisure"];

describe("computeFulfillment", () => {
  it("cân bằng hoàn hảo: actual share khớp expected share → fulfillment = 1", () => {
    // weight 1:1:2 → expected 25%/25%/50%; giờ 2:2:4 → actual trùng
    const result = computeFulfillment(
      { health: 1, work: 1, leisure: 2 },
      { health: 2, work: 2, leisure: 4 },
      AREAS
    );
    for (const row of result) expect(row.fulfillment).toBeCloseTo(1);
  });

  it("Σhours = 0 (tuần trống) → fulfillment 0 cho mọi mảng, không chia cho 0", () => {
    const result = computeFulfillment(
      { health: 3, work: 3, leisure: 3 },
      {},
      AREAS
    );
    for (const row of result) {
      expect(row.fulfillment).toBe(0);
      expect(row.actualShare).toBe(0);
      expect(Number.isFinite(row.expectedShare)).toBe(true);
    }
  });

  it("mảng vượt xa mức đủ bị cap tại FULFILLMENT_CAP", () => {
    // work expected 1/3 nhưng chiếm 100% giờ → raw 3.0, cap 1.5
    const result = computeFulfillment(
      { health: 1, work: 1, leisure: 1 },
      { work: 10 },
      AREAS
    );
    const work = result.find((row) => row.areaKey === "work")!;
    expect(work.fulfillment).toBe(FULFILLMENT_CAP);
  });

  it("tuần thiếu ngày vẫn tính theo tổng giờ đã có", () => {
    // chỉ 1 ngày dữ liệu: health 2h / work 6h
    const result = computeFulfillment(
      { health: 4, work: 4, leisure: 2 },
      { health: 2, work: 6 },
      AREAS
    );
    const health = result.find((row) => row.areaKey === "health")!;
    // expected 0.4, actual 0.25 → 0.625
    expect(health.fulfillment).toBeCloseTo(0.625);
  });

  it("mảng weight 0 (không có trong weights) → fulfillment 0", () => {
    const result = computeFulfillment(
      { health: 3, work: 3 },
      { leisure: 5, health: 1, work: 1 },
      AREAS
    );
    const leisure = result.find((row) => row.areaKey === "leisure")!;
    expect(leisure.expectedShare).toBe(0);
    expect(leisure.fulfillment).toBe(0);
  });
});

describe("isoWeekKey", () => {
  it("tính đúng tuần ISO các mốc chuẩn", () => {
    expect(isoWeekKey(new Date("2026-10-22T00:00:00"))).toBe("2026-W43");
    expect(isoWeekKey(new Date("2026-01-01T00:00:00"))).toBe("2026-W01");
    // 2027-01-01 là thứ Sáu → thuộc tuần 53 của 2026
    expect(isoWeekKey(new Date("2027-01-01T00:00:00"))).toBe("2026-W53");
    // Chủ nhật cuối tuần ISO
    expect(isoWeekKey(new Date("2026-10-25T00:00:00"))).toBe("2026-W43");
    expect(isoWeekKey(new Date("2026-10-26T00:00:00"))).toBe("2026-W44");
  });
});

describe("mondayOf", () => {
  it("trả về thứ Hai của tuần, kể cả khi date là Chủ nhật", () => {
    expect(mondayOf(new Date("2026-10-22T12:00:00")).getDate()).toBe(19);
    expect(mondayOf(new Date("2026-10-25T12:00:00")).getDate()).toBe(19);
    expect(mondayOf(new Date("2026-10-19T00:00:00")).getDate()).toBe(19);
  });
});

describe("aggregateByWeek", () => {
  it("gộp giờ theo tuần và tính mood trung bình", () => {
    const weeks = aggregateByWeek([
      { date: "2026-10-19", mood: 4, hoursByArea: { work: 8, health: 1 } },
      { date: "2026-10-20", mood: 2, hoursByArea: { work: 6 } },
      { date: "2026-10-26", mood: 5, hoursByArea: { leisure: 3 } },
    ]);
    expect(weeks).toHaveLength(2);
    expect(weeks[0].isoWeek).toBe("2026-W43");
    expect(weeks[0].days).toBe(2);
    expect(weeks[0].totalHoursByArea.work).toBe(14);
    expect(weeks[0].avgMood).toBe(3);
    expect(weeks[1].isoWeek).toBe("2026-W44");
    expect(weeks[1].avgMood).toBe(5);
  });

  it("mảng rỗng → không có tuần nào", () => {
    expect(aggregateByWeek([])).toEqual([]);
  });
});
