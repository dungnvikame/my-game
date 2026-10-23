import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleCheck, Eye, Sparkles, TriangleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS, type AreaKey } from "@/lib/areas";
import { computeAssessment } from "@/lib/onboarding/assessment";

export const instant = false; // đọc cookies/session mỗi request, không prerender

const AREA_KEYS = LIFE_AREAS.map((area) => area.key);

// Nhận định ban đầu sau onboarding — xem lại được bất cứ lúc nào qua URL này.
export default async function OnboardingSummaryPage() {
  const supabase = await createClient();

  const [{ data: profile }, { data: weightRows }, { count: routineCount }] =
    await Promise.all([
      supabase.from("profiles").select("baseline").single(),
      supabase.from("area_weights").select("area_key, weight"),
      supabase.from("routines").select("id", { count: "exact", head: true }),
    ]);

  // Chưa làm onboarding đủ bước → quay lại wizard
  if (!profile?.baseline) redirect("/onboarding");

  const weights: Partial<Record<AreaKey, number>> = {};
  for (const row of weightRows ?? []) {
    weights[row.area_key as AreaKey] = row.weight;
  }
  const baseline = profile.baseline as Partial<Record<AreaKey, number>>;
  const assessment = computeAssessment(weights, baseline, AREA_KEYS);
  const nameByKey = new Map(LIFE_AREAS.map((area) => [area.key, area.name]));
  const topHotspot = assessment.hotspots[0];

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-ink">
        <Sparkles size={14} aria-hidden /> Nhận định ban đầu
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight">
        Bức tranh hiện tại của bạn
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Suy thẳng từ ưu tiên và mức hài lòng bạn vừa khai — điểm hài lòng chung
        (có trọng số):{" "}
        <strong className="tabular-nums text-foreground">
          {assessment.avgScore.toFixed(1)}/10
        </strong>
        .
      </p>

      <div className="mt-5 flex flex-col gap-4">
        <p className="rounded-2xl border border-border bg-surface p-4 text-sm leading-relaxed shadow-sm">
          {assessment.summary}
        </p>

        {assessment.hotspots.length > 0 && (
          <section className="rounded-2xl bg-warn-soft p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-warn-ink">
              <TriangleAlert size={16} aria-hidden /> Điểm nóng — coi trọng nhưng chưa ổn
            </h2>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-warn-ink">
              {assessment.hotspots.map((r) => (
                <li key={r.areaKey}>
                  <strong>{nameByKey.get(r.areaKey)}</strong>: ưu tiên {r.weight}/5
                  nhưng hài lòng chỉ {r.score}/10.
                </li>
              ))}
            </ul>
          </section>
        )}

        {assessment.strengths.length > 0 && (
          <section className="rounded-2xl bg-success-soft p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-success-ink">
              <CircleCheck size={16} aria-hidden /> Đang ổn — giữ nhịp
            </h2>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm leading-relaxed text-success-ink">
              {assessment.strengths.map((r) => (
                <li key={r.areaKey}>
                  <strong>{nameByKey.get(r.areaKey)}</strong>: {r.score}/10 — đừng để
                  tụt khi dồn sức cho điểm nóng.
                </li>
              ))}
            </ul>
          </section>
        )}

        {assessment.blindspots.length > 0 && (
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-muted">
              <Eye size={16} aria-hidden /> Đáng tự hỏi
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {assessment.blindspots
                .map((r) => nameByKey.get(r.areaKey))
                .join(", ")}{" "}
              đang thấp cả ưu tiên lẫn hài lòng. Không quan trọng thật, hay bị bỏ
              quên lâu đến mức bạn thôi kỳ vọng?
            </p>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-sm font-semibold">Đề xuất cho 2 tuần tới</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
            {topHotspot && (
              <li>
                Mỗi ngày một hành động nhỏ cho{" "}
                <strong className="text-foreground">
                  {nameByKey.get(topHotspot.areaKey)}
                </strong>{" "}
                — điểm nóng số 1 của bạn.
              </li>
            )}
            <li>
              Check-in mỗi ngày (&lt;30 giây): tích ✓ ngày tiêu chuẩn
              {(routineCount ?? 0) > 0 && (
                <> — bạn đã chọn sẵn {routineCount} hoạt động</>
              )}
              , việc khác ghi thêm.
            </li>
            <li>Chủ nhật làm weekly review 5 phút — app sẽ nhắc.</li>
            <li>
              Từ tuần thứ hai, Dashboard bắt đầu đưa gợi ý điều chỉnh dựa trên dữ
              liệu thật của bạn.
            </li>
          </ol>
        </section>

        <Link
          href="/checkin"
          className="flex h-12 items-center justify-center rounded-xl bg-primary font-semibold text-primary-fg shadow-sm transition-[background-color,transform] duration-150 hover:bg-primary-strong active:scale-[0.98]"
        >
          Bắt đầu check-in hôm nay
        </Link>
      </div>
    </main>
  );
}
