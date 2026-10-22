"use client";

import { useOptimistic, useTransition } from "react";
import { MOOD_LABELS } from "@/lib/areas";
import { TapChip } from "@/components/tap-chip";
import { setMood } from "./actions";

// Tâm trạng lưu ngay khi tap — optimistic để chip đổi màu tức thì.
export function MoodPicker({ date, initial }: { date: string; initial: number | null }) {
  const [, startTransition] = useTransition();
  const [mood, setOptimisticMood] = useOptimistic(initial);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <span className="text-sm font-semibold">
        Tâm trạng {mood === null && <span className="font-normal text-faint">· chưa chấm</span>}
      </span>
      <div className="mt-2.5 grid grid-cols-5 gap-1.5">
        {MOOD_LABELS.map((label, i) => {
          const level = i + 1;
          return (
            <TapChip
              key={level}
              selected={mood === level}
              onClick={() =>
                startTransition(async () => {
                  setOptimisticMood(level);
                  await setMood(date, level);
                })
              }
              className="px-1 text-xs"
            >
              {label}
            </TapChip>
          );
        })}
      </div>
    </div>
  );
}
