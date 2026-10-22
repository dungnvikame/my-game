import { Suspense } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { todayYMD, ymdLocal } from "@/lib/balance/today";
import { checkinStreak } from "@/lib/balance/streak";
import { AppNav } from "@/components/app-nav";
import { ReviewBanner } from "@/components/review/review-banner";
import { CheckinForm } from "./checkin-form";

export const instant = false; // đọc cookies/session mỗi request, không prerender

/** Cho sửa tối đa 30 ngày trước; không cho ngày tương lai. */
function resolveDate(param: string | undefined, today: string): string {
  if (!param || !/^\d{4}-\d{2}-\d{2}$/.test(param)) return today;
  const min = new Date(`${today}T00:00:00`);
  min.setDate(min.getDate() - 30);
  if (param > today || param < ymdLocal(min)) return today;
  return param;
}

export default async function CheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; date?: string }>;
}) {
  const { saved, date: dateParam } = await searchParams;
  const supabase = await createClient();
  const today = todayYMD();
  const date = resolveDate(dateParam, today);
  const isToday = date === today;

  const streakSince = new Date(`${today}T00:00:00`);
  streakSince.setDate(streakSince.getDate() - 60);

  const [{ data: checkin }, { data: recentDates }] = await Promise.all([
    supabase
      .from("daily_checkins")
      .select("id, mood, checkin_hours ( area_key, hours )")
      .eq("date", date)
      .maybeSingle(),
    supabase
      .from("daily_checkins")
      .select("date")
      .gte("date", ymdLocal(streakSince)),
  ]);

  const initialHours: Record<string, number> = {};
  for (const row of checkin?.checkin_hours ?? []) {
    initialHours[row.area_key] = Number(row.hours);
  }

  const streak = checkinStreak(
    (recentDates ?? []).map((row) => row.date),
    today
  );

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-md px-4 pb-24 pt-6">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {isToday ? "Hôm nay của bạn" : "Check-in ngày cũ"}
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
              <span className="tabular-nums">{date}</span> · kéo nhanh số giờ cho
              mảng có hoạt động — bỏ qua mảng không có.
            </>
          ) : (
            <>
              Đang sửa ngày <span className="font-medium tabular-nums">{date}</span>{" "}
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

        {saved && (
          <p className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm text-success-ink">
            Đã lưu check-in. Sửa lại bên dưới nếu cần.
          </p>
        )}

        {/* key=date: đổi ngày là remount form, không giữ state ngày cũ */}
        <CheckinForm
          key={date}
          date={date}
          initialMood={checkin?.mood ?? 3}
          initialHours={initialHours}
        />
      </main>
    </>
  );
}
