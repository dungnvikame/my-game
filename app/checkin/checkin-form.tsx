"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { LIFE_AREAS, MOOD_LABELS } from "@/lib/areas";
import { saveCheckin } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="sticky bottom-4 mt-4 rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white shadow-lg disabled:opacity-50"
    >
      {pending ? "Đang lưu…" : "Lưu check-in"}
    </button>
  );
}

export function CheckinForm({
  date,
  initialMood,
  initialHours,
}: {
  date: string;
  initialMood: number;
  initialHours: Record<string, number>;
}) {
  const [mood, setMood] = useState(initialMood);
  const [hours, setHours] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    for (const area of LIFE_AREAS) base[area.key] = initialHours[area.key] ?? 0;
    return base;
  });

  const total = Object.values(hours).reduce((sum, h) => sum + h, 0);

  return (
    <form action={saveCheckin} className="mt-6 flex flex-col gap-5">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="mood" value={mood} />

      <div>
        <span className="font-medium">Tâm trạng hôm nay</span>
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {MOOD_LABELS.map((label, i) => {
            const level = i + 1;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={mood === level}
                onClick={() => setMood(level)}
                className={`rounded-md px-1 py-2.5 text-xs font-medium transition-colors ${
                  mood === level
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 active:bg-neutral-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {LIFE_AREAS.map((area) => (
        <div key={area.key}>
          <div className="flex items-baseline justify-between">
            <span className="font-medium">{area.name}</span>
            <span className="text-sm tabular-nums text-neutral-500">
              {hours[area.key].toFixed(1)}h
            </span>
          </div>
          <input type="hidden" name={`hours_${area.key}`} value={hours[area.key]} />
          <input
            type="range"
            min={0}
            max={12}
            step={0.5}
            value={hours[area.key]}
            aria-label={`Số giờ cho ${area.name}`}
            onChange={(e) =>
              setHours((prev) => ({ ...prev, [area.key]: Number(e.target.value) }))
            }
            className="mt-1 w-full accent-neutral-900"
          />
        </div>
      ))}

      <p className="text-right text-sm text-neutral-400">
        Tổng: <span className="tabular-nums">{total.toFixed(1)}h</span>
      </p>

      <SubmitButton />
    </form>
  );
}
