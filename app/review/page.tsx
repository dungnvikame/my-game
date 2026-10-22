import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS, type AreaKey } from "@/lib/areas";
import { resolveReviewWindow } from "@/lib/balance/review-week";
import { todayDate, ymdLocal } from "@/lib/balance/today";
import { AppNav } from "@/components/app-nav";
import { ScoreRow } from "@/components/review/score-row";
import { saveReview } from "./actions";

export const instant = false; // đọc cookies/session mỗi request, không prerender

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  // Chỉ phản chiếu query param khi đúng định dạng tuần ISO
  const savedWeek = saved && /^\d{4}-W\d{2}$/.test(saved) ? saved : null;
  const supabase = await createClient();
  const today = todayDate();

  const { data: reviews, error: reviewsError } = await supabase
    .from("weekly_reviews")
    .select("iso_week, area_scores, note, created_at")
    .order("iso_week", { ascending: false })
    .limit(9);

  const reviewedWeeks = new Set((reviews ?? []).map((row) => row.iso_week));
  const { targetWeek, isMakeup, targetMonday } = resolveReviewWindow(
    today,
    reviewedWeeks
  );

  // Giờ thực tế của tuần mục tiêu (từ hoạt động đã ghi) — đặt cạnh điểm tự chấm
  const sunday = new Date(targetMonday);
  sunday.setDate(sunday.getDate() + 6);
  const { data: activityRows } = await supabase
    .from("activities")
    .select("area_key, minutes")
    .gte("date", ymdLocal(targetMonday))
    .lte("date", ymdLocal(sunday));

  const hoursByArea: Partial<Record<AreaKey, number>> = {};
  for (const row of activityRows ?? []) {
    const key = row.area_key as AreaKey;
    hoursByArea[key] = (hoursByArea[key] ?? 0) + row.minutes / 60;
  }

  const existing = (reviews ?? []).find((row) => row.iso_week === targetWeek);
  const existingScores = (existing?.area_scores ?? {}) as Partial<
    Record<AreaKey, number>
  >;
  const pastReviews = (reviews ?? []).filter((row) => row.iso_week !== targetWeek);
  const nameByKey = new Map(LIFE_AREAS.map((area) => [area.key, area.name]));

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-md px-4 pb-24 pt-6">
        <h1 className="text-2xl font-bold tracking-tight">Weekly review</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Tuần {targetWeek.replace("-W", " — W")}
          {isMakeup && " (làm bù tuần trước)"} · chấm 1-10 theo cảm nhận, đặt cạnh
          giờ thực tế.
        </p>

        {reviewsError && (
          <p className="mt-4 rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn-ink">
            Chưa đọc được weekly review — có thể migration
            `002-weekly-reviews.sql` chưa chạy trên Supabase.
          </p>
        )}

        {savedWeek && (
          <p className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm text-success-ink">
            Đã lưu review tuần {savedWeek}.
            {savedWeek !== targetWeek &&
              ` Form bên dưới đã chuyển sang tuần ${targetWeek}.`}
          </p>
        )}

        {/* key=targetWeek: đổi tuần là remount, tránh giữ điểm tuần cũ trong state */}
        <form key={targetWeek} action={saveReview} className="mt-5 flex flex-col gap-4">
          <input type="hidden" name="iso_week" value={targetWeek} />
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-4 shadow-sm">
            {LIFE_AREAS.map((area) => (
              <ScoreRow
                key={area.key}
                area={area}
                hours={hoursByArea[area.key] ?? 0}
                initial={existingScores[area.key] ?? 5}
              />
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <label className="text-sm font-semibold" htmlFor="note">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              defaultValue={existing?.note ?? ""}
              placeholder="Một điều đáng nhớ, một điều muốn đổi tuần tới…"
              className="mt-2 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-base transition-colors duration-150 placeholder:text-faint focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="h-12 cursor-pointer rounded-xl bg-primary font-semibold text-primary-fg shadow-sm transition-[background-color,transform] duration-150 hover:bg-primary-strong active:scale-[0.98]"
          >
            {existing ? "Cập nhật review" : "Lưu review"}
          </button>
        </form>

        {pastReviews.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold tracking-tight">Các tuần trước</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {pastReviews.map((row) => {
                const scores = (row.area_scores ?? {}) as Partial<
                  Record<AreaKey, number>
                >;
                return (
                  <li
                    key={row.iso_week}
                    className="rounded-2xl border border-border bg-surface px-4 py-3.5 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-primary-ink">
                      {row.iso_week}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">
                      {LIFE_AREAS.map(
                        (area) => `${nameByKey.get(area.key)} ${scores[area.key] ?? "–"}`
                      ).join(" · ")}
                    </p>
                    {row.note && (
                      <p className="mt-2 border-t border-border pt-2 text-sm leading-relaxed">
                        {row.note}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
