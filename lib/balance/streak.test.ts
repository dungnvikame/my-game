import { describe, expect, it } from "vitest";
import { checkinStreak } from "./streak";

const TODAY = "2026-10-22";

describe("checkinStreak", () => {
  it("đếm chuỗi liên tiếp gồm hôm nay", () => {
    expect(checkinStreak(["2026-10-20", "2026-10-21", "2026-10-22"], TODAY)).toBe(3);
  });

  it("hôm nay chưa check-in → chuỗi kết thúc hôm qua vẫn giữ", () => {
    expect(checkinStreak(["2026-10-20", "2026-10-21"], TODAY)).toBe(2);
  });

  it("đứt quãng thì dừng ở chỗ đứt", () => {
    expect(checkinStreak(["2026-10-18", "2026-10-21", "2026-10-22"], TODAY)).toBe(2);
  });

  it("không có gì hoặc chỉ ngày cũ → 0", () => {
    expect(checkinStreak([], TODAY)).toBe(0);
    expect(checkinStreak(["2026-10-15"], TODAY)).toBe(0);
  });

  it("qua ranh giới tháng", () => {
    expect(checkinStreak(["2026-09-30", "2026-10-01"], "2026-10-01")).toBe(2);
  });
});
