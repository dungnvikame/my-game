import { Suspense } from "react";
import Link from "next/link";
import { Flame, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS, type AreaKey } from "@/lib/areas";
import { todayYMD, ymdLocal } from "@/lib/balance/today";
import { resolveCheckinDate } from "@/lib/balance/checkin-window";
import { checkinStreak } from "@/lib/balance/streak";
import { AppNav } from "@/components/app-nav";
import { ReviewBanner } from "@/components/review/review-banner";
import { MoodPicker } from "./mood-picker";
import { ActivityForm } from "./activity-form";
import { deleteActivity } from "./actions";

export const instant = false; // đọc cookies/session mỗi request, không prerender

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}p`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const supabase = await createClient();
  const today = todayYMD();
  const date = resolveCheckinDate(dateParam, today);
  const isToday = date === today;

  const streakSince = new Date(`${today}T00:00:00`);
  streakSince.setDate(streakSince.getDate() - 60);

  const [{ data: checkin }, { data: activities }, { data: activityDates }, { data: moodDates }] =
    await Promise.all([
      supabase.from("daily_checkins").select("mood").eq("date", date).maybeSingle(),
      supabase
        .from("activities")
        .select("id, area_key, minutes, note, created_at")
        .eq("date", date)
        .order("created_at"),
      supabase.from("activities").select("date").gte("date", ymdLocal(streakSince)),
      supabase.from("daily_checkins").select("date").gte("date", ymdLocal(streakSince)),
    ]);

  const nameByKey = new Map(LIFE_AREAS.map((area) => [area.key, area.name]));
  const entries = activities ?? [];
  const totalMinutes = entries.reduce((sum, a) => sum + a.minutes, 0);
  const touchedAreas = new Set(entries.map((a) => a.area_key as AreaKey));
  const untouched = LIFE_AREAS.filter((area) => !touchedAreas.has(area.key));
  // Ngày "có mặt" = có mood hoặc có hoạt động — khớp cách đếm ở trang Lịch sử
  const streak = checkinStreak(
    [...(activityDates ?? []), ...(moodDates ?? [])].map((row) => row.date),
    today
  );

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-md px-4 pb-24 pt-6">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {isToday ? "Hôm nay của bạn" : "Nhìn lại ngày cũ"}
          </h1>
          {streak > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-ink">
              <Flame size={14} aria-hidden /> {streak} ngày
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {isToday ? (
            <>
              <span className="tabular-nums">{date}</span> · làm gì cho mảng nào,
              ghi lại ngay lúc đó — mỗi lần chỉ vài giây.
            </>
          ) : (
            <>
              Đang ghi cho ngày <span className="font-medium tabular-nums">{date}</span>{" "}
              ·{" "}
              <Link
                href="/checkin"
                className="font-medium text-primary-ink underline underline-offset-4"
              >
                về hôm nay
              </Link>
            </>
          )}
        </p>

        {isToday && (
          <Suspense fallback={null}>
            <ReviewBanner />
          </Suspense>
        )}

        <div className="mt-5 flex flex-col gap-4">
          <MoodPicker date={date} initial={checkin?.mood ?? null} />
          <ActivityForm date={date} />

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">
                {isToday ? "Hôm nay đã diễn ra" : "Ngày đó đã diễn ra"}
              </h2>
              {totalMinutes > 0 && (
                <span className="text-sm font-semibold tabular-nums text-primary-ink">
                  {formatMinutes(totalMinutes)}
                </span>
              )}
            </div>

            {entries.length === 0 ? (
              <p className="mt-3 rounded-xl bg-surface-2 px-4 py-5 text-center text-sm leading-relaxed text-muted">
                Chưa có hoạt động nào. Vừa làm gì đó? Ghi lại ở trên — đó là bằng
                chứng bạn đã sống ngày này thế nào.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col">
                {entries.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
                  >
                    <span className="w-24 shrink-0 text-xs font-medium text-primary-ink">
                      {nameByKey.get(a.area_key as AreaKey) ?? a.area_key}
                    </span>
                    <span className="flex-1 text-sm">
                      {a.note ?? <span className="text-faint">(không ghi chú)</span>}
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatMinutes(a.minutes)}
                    </span>
                    <form action={deleteActivity} className="shrink-0">
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        aria-label="Xóa hoạt động này"
                        className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-danger"
                      >
                        <X size={16} aria-hidden />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            {entries.length > 0 && untouched.length > 0 && (
              <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-faint">
                Chưa đụng tới: {untouched.map((area) => area.name).join(", ")}.
              </p>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
