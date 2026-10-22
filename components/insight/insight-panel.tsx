"use client";

import { Check, Lightbulb, X } from "lucide-react";
import type { Suggestion } from "@/lib/insight/rules";
import { reactToSuggestion } from "@/app/dashboard/actions";

export type SuggestionStatus = "accepted" | "dismissed";

// Panel gợi ý tuần: mỗi card có căn cứ số liệu + Nhận/Bỏ qua.
// Gợi ý đã Bỏ qua thì ẩn; đã Nhận thì giữ lại kèm badge.
export function InsightPanel({
  suggestions,
  statuses,
}: {
  suggestions: Suggestion[];
  statuses: Partial<Record<string, SuggestionStatus>>; // key = `${areaKey}:${ruleKey}`
}) {
  const visible = suggestions.filter(
    (s) => statuses[`${s.areaKey}:${s.ruleKey}`] !== "dismissed"
  );
  if (visible.length === 0) return null;

  return (
    <section className="mt-5">
      <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
        <Lightbulb size={20} className="text-primary" aria-hidden />
        Gợi ý tuần này
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {visible.map((s) => {
          const status = statuses[`${s.areaKey}:${s.ruleKey}`];
          return (
            <li
              key={`${s.areaKey}:${s.ruleKey}`}
              className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
            >
              <p className="text-sm font-medium leading-relaxed">{s.suggestion}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                Căn cứ: {s.evidence}
              </p>
              {status === "accepted" ? (
                <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-success-soft px-2.5 py-1 text-xs font-medium text-success-ink">
                  <Check size={14} aria-hidden /> Đã nhận — làm trong tuần này
                </p>
              ) : (
                <div className="mt-3 flex gap-2">
                  <form action={reactToSuggestion} className="flex-1">
                    <input type="hidden" name="area_key" value={s.areaKey} />
                    <input type="hidden" name="rule_key" value={s.ruleKey} />
                    <input type="hidden" name="status" value="accepted" />
                    <button
                      type="submit"
                      className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-fg transition-transform duration-150 active:scale-[0.98]"
                    >
                      <Check size={16} aria-hidden /> Nhận
                    </button>
                  </form>
                  <form action={reactToSuggestion} className="flex-1">
                    <input type="hidden" name="area_key" value={s.areaKey} />
                    <input type="hidden" name="rule_key" value={s.ruleKey} />
                    <input type="hidden" name="status" value="dismissed" />
                    <button
                      type="submit"
                      className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-surface-2 text-sm font-medium text-muted transition-transform duration-150 active:scale-[0.98]"
                    >
                      <X size={16} aria-hidden /> Bỏ qua
                    </button>
                  </form>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
