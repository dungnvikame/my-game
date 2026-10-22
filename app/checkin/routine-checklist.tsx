"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Circle, CircleCheck, Settings2 } from "lucide-react";
import { toggleRoutine } from "./actions";

export interface ChecklistItem {
  id: string;
  label: string;
  areaName: string;
  durationLabel: string;
  done: boolean;
}

// Checklist ngày tiêu chuẩn: tích ✓ = ghi hoạt động, bỏ tích = xóa.
// Optimistic để phản hồi tức thì khi tap.
export function RoutineChecklist({ date, items }: { date: string; items: ChecklistItem[] }) {
  const [, startTransition] = useTransition();
  const [optimisticItems, applyToggle] = useOptimistic(
    items,
    (state, toggled: { id: string; done: boolean }) =>
      state.map((item) => (item.id === toggled.id ? { ...item, done: toggled.done } : item))
  );

  const doneCount = optimisticItems.filter((item) => item.done).length;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">
          Ngày tiêu chuẩn{" "}
          <span className="font-normal tabular-nums text-faint">
            {doneCount}/{optimisticItems.length}
          </span>
        </h2>
        <Link
          href="/routines"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-primary"
        >
          <Settings2 size={14} aria-hidden /> Sửa
        </Link>
      </div>

      <ul className="mt-1.5 flex flex-col">
        {optimisticItems.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={item.done}
              onClick={() =>
                startTransition(async () => {
                  applyToggle({ id: item.id, done: !item.done });
                  await toggleRoutine(item.id, date, !item.done);
                })
              }
              className="flex min-h-12 w-full cursor-pointer items-center gap-3 border-b border-border py-2 text-left transition-colors duration-150 last:border-b-0 active:bg-surface-2"
            >
              {item.done ? (
                <CircleCheck size={22} className="shrink-0 text-primary" aria-hidden />
              ) : (
                <Circle size={22} className="shrink-0 text-faint" aria-hidden />
              )}
              <span
                className={`flex-1 text-sm transition-colors duration-150 ${
                  item.done ? "text-muted line-through decoration-faint" : ""
                }`}
              >
                {item.label}
              </span>
              <span className="shrink-0 text-xs text-faint">
                {item.areaName} · {item.durationLabel}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
