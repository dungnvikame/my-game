import { describe, expect, it } from "vitest";
import {
  currentWeekKey,
  previousWeekKey,
  resolveReviewWindow,
  shouldRemindReview,
} from "./review-week";

// 2026-10-22 = thứ Năm, tuần W43; 2026-10-25 = CN W43; 2026-10-26 = T2 W44
const SUN = new Date("2026-10-25T10:00:00");
const MON = new Date("2026-10-26T10:00:00");
const WED = new Date("2026-10-28T10:00:00");
const THU = new Date("2026-10-29T10:00:00");

describe("previousWeekKey", () => {
  it("tuần trước bình thường và rollover năm", () => {
    expect(previousWeekKey(MON)).toBe("2026-W43");
    // 2027-01-04 là thứ Hai tuần 2027-W01 → tuần trước là 2026-W53
    expect(previousWeekKey(new Date("2027-01-04T08:00:00"))).toBe("2026-W53");
  });
});

describe("resolveReviewWindow", () => {
  it("T2-T4, tuần trước chưa review → làm bù tuần trước", () => {
    const win = resolveReviewWindow(MON, new Set());
    expect(win.targetWeek).toBe("2026-W43");
    expect(win.isMakeup).toBe(true);
    expect(win.targetMonday.getDate()).toBe(19); // thứ Hai 19/10
  });

  it("T2-T4, tuần trước đã review → target tuần hiện tại", () => {
    const win = resolveReviewWindow(WED, new Set(["2026-W43"]));
    expect(win.targetWeek).toBe("2026-W44");
    expect(win.isMakeup).toBe(false);
  });

  it("ngoài cửa sổ làm bù (T5) → target tuần hiện tại dù tuần trước trống", () => {
    const win = resolveReviewWindow(THU, new Set());
    expect(win.targetWeek).toBe(currentWeekKey(THU));
    expect(win.isMakeup).toBe(false);
  });

  it("CN → target tuần hiện tại", () => {
    const win = resolveReviewWindow(SUN, new Set());
    expect(win.targetWeek).toBe("2026-W43");
    expect(win.isMakeup).toBe(false);
  });
});

describe("shouldRemindReview", () => {
  it("CN chưa review tuần này → nhắc; đã review → thôi", () => {
    expect(shouldRemindReview(SUN, new Set())).toBe(true);
    expect(shouldRemindReview(SUN, new Set(["2026-W43"]))).toBe(false);
  });

  it("T2-T4 chưa review tuần trước → nhắc; đã review → thôi", () => {
    expect(shouldRemindReview(MON, new Set())).toBe(true);
    expect(shouldRemindReview(WED, new Set(["2026-W43"]))).toBe(false);
  });

  it("T5-T7 không nhắc", () => {
    expect(shouldRemindReview(THU, new Set())).toBe(false);
  });
});
