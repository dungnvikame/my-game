import Link from "next/link";
import { ChevronRight, Flame, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MOOD_LABELS } from "@/lib/areas";
import { todayYMD, ymdLocal } from "@/lib/balance/today";
import { checkinStreak } from "@/lib/balance/streak";
import { AppNav } from "@/components/app-nav";
import { signOut } from "./actions";

export const instant = false; // đọc cookies/session mỗi request, không prerender

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;
const DAYS_SHOWN = 14;

export default async function HistoryPage() {
  const supabase = await createClient();
  const today = todayYMD();

  const since = new Date(`${today}T00:00:00`);
  since.setDate(since.getDate() - 60); // 60 ngày: đủ cho streak + danh sách

  const { data: rows } = await supabase
    .from("daily_checkins")
    .select("date, mood, checkin_hours ( hours )")
    .gte("date", ymdLocal(since))
    .order("date", { ascending: false });

  const byDate = new Map(
    (rows ?? []).map((row) => [
      row.date,
      {
        mood: row.mood,
        total: (row.checkin_hours ?? []).reduce((sum, h) => sum + Number(h.hours), 0),
      },
    ])
  );
  const streak = checkinStreak(byDate.keys(), today);

  // 14 ngày gần nhất, cả ngày chưa check-in (để bấm vào làm bù)
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => {
    const d = new Date(`${today}T00:00:00`);
    d.setDate(d.getDate() - i);
    const ymd = ymdLocal(d);
    return { ymd, weekday: WEEKDAYS[d.getDay()], entry: byDate.get(ymd) };
  });
  const checkedCount = days.filter((day) => day.entry).length;

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-md px-4 pb-24 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Lịch sử</h1>

        <div className="mt-4 flex gap-3">
          <div className="flex flex-1 flex-col gap-0.5 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
              <Flame size={14} className="text-primary" aria-hidden /> Chuỗi hiện tại
            </span>
            <span className="text-2xl font-bold tabular-nums">
              {streak} <span className="text-sm font-medium text-muted">ngày</span>
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-0.5 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <span className="text-xs font-medium text-muted">14 ngày qua</span>
            <span className="text-2xl font-bold tabular-nums">
              {checkedCount}
              <span className="text-sm font-medium text-muted">/{DAYS_SHOWN} check-in</span>
            </span>
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-2">
          {days.map(({ ymd, weekday, entry }) => (
            <li key={ymd}>
              <Link
                href={ymd === today ? "/checkin" : `/checkin?date=${ymd}`}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm transition-transform duration-150 active:scale-[0.99]"
              >
                <span className="w-16 shrink-0">
                  <span className="block text-xs font-medium text-faint">
                    {weekday}
                    {ymd === today && " · nay"}
                  </span>
                  <span className="block text-sm font-semibold tabular-nums">
                    {ymd.slice(5)}
                  </span>
                </span>
                {entry ? (
                  <span className="flex-1 text-sm">
                    <span className="font-semibold tabular-nums">
                      {entry.total.toFixed(1)}h
                    </span>
                    <span className="ml-2 text-muted">
                      {MOOD_LABELS[entry.mood - 1]}
                    </span>
                  </span>
                ) : (
                  <span className="flex-1 text-sm text-faint">
                    Chưa check-in — bấm để làm bù
                  </span>
                )}
                <ChevronRight size={18} className="shrink-0 text-faint" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-medium text-danger transition-colors duration-150 hover:bg-surface-2"
          >
            <LogOut size={16} aria-hidden /> Đăng xuất
          </button>
        </form>
      </main>
    </>
  );
}
