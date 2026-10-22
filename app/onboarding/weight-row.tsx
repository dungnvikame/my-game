"use client";

import { useState } from "react";
import type { LifeArea } from "@/lib/areas";

// Một hàng chọn trọng số 1-5 bằng tap, không gõ.
export function WeightRow({ area, initial }: { area: LifeArea; initial: number }) {
  const [value, setValue] = useState(initial);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-medium">{area.name}</span>
        <span className="text-xs text-neutral-400">{area.hint}</span>
      </div>
      <input type="hidden" name={`weight_${area.key}`} value={value} />
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            aria-label={`${area.name}: mức ${level}`}
            aria-pressed={value === level}
            onClick={() => setValue(level)}
            className={`rounded-md py-2.5 text-sm font-medium transition-colors ${
              value === level
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 active:bg-neutral-200"
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}
