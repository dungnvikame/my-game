import Link from "next/link";
import { Suspense } from "react";
import { TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_WEIGHT, LIFE_AREAS, type AreaKey } from "@/lib/areas";
import {
  aggregateByWeek,
  computeFulfillment,
  isoWeekKey,
  mondayOf,
  type DayEntry,
} from "@/lib/balance/score";
import { todayDate, ymdLocal } from "@/lib/balance/today";
import { currentWeekKey, previousWeekKey } from "@/lib/balance/review-week";
import { computeSuggestions, type InsightWeek } from "@/lib/insight/rules";
import { AppNav } from "@/components/app-nav";
import { BalanceWheel } from "@/components/dashboard/balance-wheel";
import { AreaTrend } from "@/components/dashboard/area-trend";
import { ReviewBanner } from "@/components/review/review-banner";
import { InsightPanel, type SuggestionStatus } from "@/components/insight/insight-panel";

export const instant = false; // đọc cookies/session mỗi request, không prerender

const AREA_KEYS = LIFE_AREAS.map((area) => area.key);

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = todayDate();
  // 8 tuần ISO tròn cho trend: từ thứ Hai của 7 tuần trước đến hết tuần này
  const since = mondayOf(today);
  since.setDate(since.getDate() - 49);
  const last7 = new Date(today);
  last7.setDate(last7.getDate() - 6); // 7 ngày gần nhất tính cả hôm nay

  const thisWeek = currentWeekKey(today);
  const prevWeek = previousWeekKey(today);

  const [
    { data: weightRows },
    { data: activityRows },
    { data: moodRows },
    { data: reviewRow },
    { data: reactionRows },
  ] = await Promise.all([
    supabase.from("area_weights").select("area_key, weight"),
    supabase
      .from("activities")
      .select("date, area_key, minutes")
      .gte("date", ymdLocal(since)),
    supabase.from("daily_checkins").select("date, mood").gte("date", ymdLocal(since)),
    supabase
      .from("weekly_reviews")
      .select("area_scores")
      .eq("iso_week", prevWeek)
      .maybeSingle(),
    supabase
      .from("suggestions")
      .select("area_key, rule_key, status")
      .eq("iso_week", thisWeek),
  ]);

  const weights: Partial<Record<AreaKey, number>> = {};
  for (const row of weightRows ?? []) {
    weights[row.area_key as AreaKey] = row.weight;
  }
  for (const key of AREA_KEYS) weights[key] ??= DEFAULT_WEIGHT;

  // Giờ/mảng/ngày suy ra từ hoạt động đã ghi (bằng chứng), mood từ daily_checkins
  const hoursByDate = new Map<string, Partial<Record<AreaKey, number>>>();
  for (const row of activityRows ?? []) {
    const areaKey = row.area_key as AreaKey;
    const day = hoursByDate.get(row.date) ?? {};
    day[areaKey] = (day[areaKey] ?? 0) + row.minutes / 60;
    hoursByDate.set(row.date, day);
  }
  const moodByDate = new Map((moodRows ?? []).map((row) => [row.date, row.mood]));
  const allDates = new Set([...hoursByDate.keys(), ...moodByDate.keys()]);
  const entries: DayEntry[] = [...allDates].sort().map((date) => ({
    date,
    mood: moodByDate.get(date),
    hoursByArea: hoursByDate.get(date) ?? {},
  }));

  // Wheel: tổng giờ 7 ngày gần nhất
  const last7Str = ymdLocal(last7);
  const hours7: Partial<Record<AreaKey, number>> = {};
  for (const entry of entries) {
    if (entry.date < last7Str) continue;
    for (const [key, hours] of Object.entries(entry.hoursByArea)) {
      const areaKey = key as AreaKey;
      hours7[areaKey] = (hours7[areaKey] ?? 0) + (hours ?? 0);
    }
  }
  const fulfillment = computeFulfillment(weights, hours7, AREA_KEYS);
  const nameByKey = new Map(LIFE_AREAS.map((area) => [area.key, area.name]));
  const wheelData = fulfillment.map((row) => ({
    name: nameByKey.get(row.areaKey) ?? row.areaKey,
    pct: row.fulfillment * 100,
    hours: row.hours,
  }));

  // Trend: đủ 8 slot tuần liên tiếp; tuần không có check-in → null (gap trên chart)
  const aggregates = new Map(
    aggregateByWeek(entries).map((week) => [week.isoWeek, week])
  );
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const monday = new Date(since);
    monday.setDate(since.getDate() + i * 7);
    const key = isoWeekKey(monday);
    const agg = aggregates.get(key);
    return agg
      ? {
          isoWeek: key,
          hoursByArea: agg.totalHoursByArea,
          avgMood: agg.moodDays > 0 ? agg.avgMood : null,
        }
      : { isoWeek: key, hoursByArea: null, avgMood: null };
  });

  const hasData = entries.length > 0;
  const wheelHasData = fulfillment.some((row) => row.hours > 0);

  // Chỉ mặt "mất cân bằng" 7 ngày: mảng hụt sâu nhất + mảng đang nuốt thời gian
  const shortfalls = fulfillment
    .filter((row) => row.expectedShare > 0 && row.fulfillment < 0.5)
    .sort((a, b) => a.fulfillment - b.fulfillment)
    .slice(0, 2);
  const overloads = fulfillment
    .filter(
      (row) => row.expectedShare > 0 && row.hours > 0 && row.actualShare > 2 * row.expectedShare
    )
    .sort(
      (a, b) => b.actualShare / b.expectedShare - a.actualShare / a.expectedShare
    )
    .slice(0, 1);

  // Insight: 2 tuần đã kết thúc gần nhất CÓ dữ liệu (tuần trống bỏ, đúng thiết kế rule)
  const prevPrevMonday = mondayOf(today);
  prevPrevMonday.setDate(prevPrevMonday.getDate() - 14);
  const prevPrevWeek = isoWeekKey(prevPrevMonday);
  const toInsightWeek = (isoWeek: string): InsightWeek | null => {
    const slot = weeks.find((w) => w.isoWeek === isoWeek);
    if (!slot?.hoursByArea) return null;
    const rows = computeFulfillment(weights, slot.hoursByArea, AREA_KEYS);
    const week: InsightWeek = {
      isoWeek,
      fulfillment: {},
      actualShare: {},
      expectedShare: {},
    };
    for (const row of rows) {
      week.fulfillment[row.areaKey] = row.fulfillment;
      week.actualShare[row.areaKey] = row.actualShare;
      week.expectedShare[row.areaKey] = row.expectedShare;
    }
    return week;
  };
  // Tuần kết thúc gần nhất không có dữ liệu → không gợi ý (tránh khuyên từ số liệu cũ)
  const lastInsightWeek = toInsightWeek(prevWeek);
  const insightWeeks = lastInsightWeek
    ? [toInsightWeek(prevPrevWeek), lastInsightWeek].filter((w) => w !== null)
    : [];
  const areaNames = Object.fromEntries(
    LIFE_AREAS.map((area) => [area.key, area.name])
  ) as Record<AreaKey, string>;
  const suggestions = computeSuggestions({
    weeks: insightWeeks,
    reviewScores: (reviewRow?.area_scores ?? undefined) as
      | Partial<Record<AreaKey, number>>
      | undefined,
    areaNames,
    areaKeys: AREA_KEYS,
  });
  const statuses: Partial<Record<string, SuggestionStatus>> = {};
  for (const row of reactionRows ?? []) {
    statuses[`${row.area_key}:${row.rule_key}`] = row.status as SuggestionStatus;
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-md px-4 pb-24 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Bánh xe cân bằng</h1>
        <p className="mt-1 text-sm text-muted">7 ngày gần nhất</p>

        <Suspense fallback={null}>
          <ReviewBanner />
        </Suspense>

        <InsightPanel suggestions={suggestions} statuses={statuses} />

        {hasData ? (
          <>
            {wheelHasData && (shortfalls.length > 0 || overloads.length > 0) && (
              <div className="mt-4 rounded-2xl bg-warn-soft p-4">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-warn-ink">
                  <TriangleAlert size={16} aria-hidden /> Đang mất cân bằng (7 ngày)
                </p>
                <ul className="mt-1.5 flex flex-col gap-1 text-sm leading-relaxed text-warn-ink">
                  {shortfalls.map((row) => (
                    <li key={row.areaKey}>
                      Hụt <strong>{nameByKey.get(row.areaKey)}</strong>: mới đạt{" "}
                      {Math.round(row.fulfillment * 100)}% mức đủ (
                      {row.hours.toFixed(1)}h).
                    </li>
                  ))}
                  {overloads.map((row) => (
                    <li key={row.areaKey}>
                      <strong>{nameByKey.get(row.areaKey)}</strong> đang nuốt thời
                      gian: chiếm {Math.round(row.actualShare * 100)}% tổng giờ,
                      kỳ vọng {Math.round(row.expectedShare * 100)}%.
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {wheelHasData ? (
              <div className="mt-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
                <BalanceWheel data={wheelData} />
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-surface-2 px-4 py-8 text-center text-sm leading-relaxed text-muted">
                7 ngày gần nhất chưa có check-in — bánh xe sẽ hiện lại sau{" "}
                <Link
                  href="/checkin"
                  className="font-medium text-primary-ink underline underline-offset-4"
                >
                  check-in tiếp theo
                </Link>
                .
              </p>
            )}

            <h2 className="mt-8 text-lg font-bold tracking-tight">Trend theo tuần</h2>
            <p className="mb-3 mt-1 text-sm text-muted">8 tuần gần nhất</p>
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <AreaTrend weeks={weeks} />
            </div>
          </>
        ) : (
          <p className="mt-6 rounded-2xl bg-surface-2 px-4 py-10 text-center text-sm leading-relaxed text-muted">
            Chưa có dữ liệu. Bắt đầu bằng một{" "}
            <Link
              href="/checkin"
              className="font-medium text-primary-ink underline underline-offset-4"
            >
              check-in hôm nay
            </Link>{" "}
            — bánh xe sẽ hiện sau check-in đầu tiên.
          </p>
        )}
      </main>
    </>
  );
}
