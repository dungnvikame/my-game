"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { DEFAULT_WEIGHT, LIFE_AREAS, type AreaKey } from "@/lib/areas";
import { ROUTINE_TEMPLATES } from "@/lib/onboarding/templates";
import { formatMinutes } from "@/lib/balance/format";
import { TapChip } from "@/components/tap-chip";
import { completeOnboarding } from "./actions";

const STEPS = ["Ưu tiên", "Hiện trạng", "Ngày tiêu chuẩn"] as const;

const STEP_INTRO: Record<number, { title: string; desc: string }> = {
  0: {
    title: "Giai đoạn này, điều gì quan trọng với bạn?",
    desc: "Chấm mức ưu tiên 1–5 cho từng mảng. Đây là chuẩn để app đo độ cân bằng — sửa lại được bất cứ lúc nào.",
  },
  1: {
    title: "Hiện tại từng mảng đang thế nào?",
    desc: "Tự chấm mức hài lòng 1–10 theo cảm nhận thật. App sẽ so ưu tiên với hiện trạng để chỉ ra chỗ cần hành động.",
  },
  2: {
    title: "Một ngày tiêu chuẩn của bạn có gì?",
    desc: "Chọn những việc bạn làm (hoặc muốn làm) gần như mỗi ngày — check-in hằng ngày chỉ cần tích ✓. Thêm/sửa được sau.",
  },
};

export function OnboardingWizard({
  initialWeights,
}: {
  initialWeights: Partial<Record<AreaKey, number>>;
}) {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [weights, setWeights] = useState<Record<AreaKey, number>>(() => {
    const base = {} as Record<AreaKey, number>;
    for (const area of LIFE_AREAS)
      base[area.key] = initialWeights[area.key] ?? DEFAULT_WEIGHT;
    return base;
  });
  const [baseline, setBaseline] = useState<Record<AreaKey, number>>(() => {
    const base = {} as Record<AreaKey, number>;
    for (const area of LIFE_AREAS) base[area.key] = 5;
    return base;
  });
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());

  const intro = STEP_INTRO[step];

  function toggleTemplate(id: string) {
    setSelectedTemplates((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function finish() {
    startTransition(async () => {
      await completeOnboarding({
        weights,
        baseline,
        routineTemplateIds: [...selectedTemplates],
      });
    });
  }

  return (
    <div>
      {/* Thanh tiến trình 3 bước */}
      <ol className="flex gap-1.5" aria-label="Tiến trình onboarding">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
              i <= step ? "bg-primary" : "bg-surface-2"
            }`}
          />
        ))}
      </ol>
      <p className="mt-2 text-xs font-medium text-faint">
        Bước {step + 1}/3 · {STEPS[step]}
      </p>

      <h1 className="mt-3 text-2xl font-bold tracking-tight">{intro.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{intro.desc}</p>

      <div className="mt-5">
        {step === 0 && (
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            {LIFE_AREAS.map((area) => (
              <div key={area.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{area.name}</span>
                  <span className="text-xs text-faint">{area.hint}</span>
                </div>
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <TapChip
                      key={level}
                      selected={weights[area.key] === level}
                      onClick={() => setWeights({ ...weights, [area.key]: level })}
                      ariaLabel={`${area.name}: mức ${level}`}
                    >
                      {level}
                    </TapChip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            {LIFE_AREAS.map((area) => (
              <div key={area.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{area.name}</span>
                  <span className="text-xs tabular-nums text-faint">
                    {baseline[area.key]}/10
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-5 gap-1 min-[400px]:grid-cols-10">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                    <TapChip
                      key={level}
                      selected={baseline[area.key] === level}
                      onClick={() => setBaseline({ ...baseline, [area.key]: level })}
                      ariaLabel={`${area.name}: điểm ${level}`}
                      className="rounded-lg px-0 text-xs"
                    >
                      {level}
                    </TapChip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            {LIFE_AREAS.map((area) => {
              const templates = ROUTINE_TEMPLATES.filter((t) => t.areaKey === area.key);
              return (
                <div
                  key={area.key}
                  className="rounded-2xl border border-border bg-surface p-4 shadow-sm"
                >
                  <span className="text-sm font-semibold">{area.name}</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {templates.map((t) => (
                      <TapChip
                        key={t.id}
                        selected={selectedTemplates.has(t.id)}
                        onClick={() => toggleTemplate(t.id)}
                        className="px-3 text-xs"
                      >
                        {t.label} · {formatMinutes(t.minutes)}
                      </TapChip>
                    ))}
                  </div>
                </div>
              );
            })}
            <p className="text-xs leading-relaxed text-faint">
              Đã chọn {selectedTemplates.size} hoạt động. Không bắt buộc — bỏ qua
              được và thêm sau trong app.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-surface-2 px-5 font-medium text-muted transition-transform duration-150 active:scale-[0.98]"
          >
            <ArrowLeft size={18} aria-hidden /> Lại
          </button>
        )}
        {step < 2 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary font-semibold text-primary-fg shadow-sm transition-[background-color,transform] duration-150 hover:bg-primary-strong active:scale-[0.98]"
          >
            Tiếp tục <ArrowRight size={18} aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={finish}
            className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary font-semibold text-primary-fg shadow-sm transition-[background-color,transform] duration-150 hover:bg-primary-strong active:scale-[0.98] disabled:opacity-50"
          >
            <Sparkles size={18} aria-hidden />
            {pending ? "Đang phân tích…" : "Hoàn tất & xem nhận định"}
          </button>
        )}
      </div>
    </div>
  );
}
