import Link from "next/link";
import { Suspense } from "react";
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
import { AppNav } from "@/components/app-nav";
import { BalanceWheel } from "@/components/dashboard/balance-wheel";
import { AreaTrend } from "@/components/dashboard/area-trend";
import { ReviewBanner } from "@/components/review/review-banner";

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

  const [{ data: weightRows }, { data: checkinRows }] = await Promise.all([
    supabase.from("area_weights").select("area_key, weight"),
    supabase
      .from("daily_checkins")
      .select("date, mood, checkin_hours ( area_key, hours )")
      .gte("date", ymdLocal(since))
      .order("date"),
  ]);

  const weights: Partial<Record<AreaKey, number>> = {};
  for (const row of weightRows ?? []) {
    weights[row.area_key as AreaKey] = row.weight;
  }
  for (const key of AREA_KEYS) weights[key] ??= DEFAULT_WEIGHT;

  const entries: DayEntry[] = (checkinRows ?? []).map((row) => {
    const hoursByArea: Partial<Record<AreaKey, number>> = {};
    for (const h of row.checkin_hours ?? []) {
      hoursByArea[h.area_key as AreaKey] = Number(h.hours);
    }
    return { date: row.date, mood: row.mood, hoursByArea };
  });

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
      ? { isoWeek: key, hoursByArea: agg.totalHoursByArea, avgMood: agg.avgMood }
      : { isoWeek: key, hoursByArea: null, avgMood: null };
  });

  const hasData = entries.length > 0;
  const wheelHasData = fulfillment.some((row) => row.hours > 0);

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-md px-4 py-6">
        <h1 className="text-xl font-bold">Bánh xe cân bằng</h1>
        <p className="mt-1 text-sm text-neutral-500">7 ngày gần nhất</p>

        <Suspense fallback={null}>
          <ReviewBanner />
        </Suspense>

        {hasData ? (
          <>
            {wheelHasData ? (
              <div className="mt-4">
                <BalanceWheel data={wheelData} />
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-neutral-100 px-4 py-6 text-center text-sm text-neutral-500">
                7 ngày gần nhất chưa có check-in — bánh xe sẽ hiện lại sau{" "}
                <Link href="/checkin" className="font-medium underline underline-offset-2">
                  check-in tiếp theo
                </Link>
                .
              </p>
            )}

            <h2 className="mt-8 text-lg font-bold">Trend theo tuần</h2>
            <p className="mb-3 mt-1 text-sm text-neutral-500">8 tuần gần nhất</p>
            <AreaTrend weeks={weeks} />
          </>
        ) : (
          <p className="mt-6 rounded-lg bg-neutral-100 px-4 py-6 text-center text-sm text-neutral-500">
            Chưa có dữ liệu. Bắt đầu bằng một{" "}
            <Link href="/checkin" className="font-medium underline underline-offset-2">
              check-in hôm nay
            </Link>{" "}
            — bánh xe sẽ hiện sau check-in đầu tiên.
          </p>
        )}
      </main>
    </>
  );
}
