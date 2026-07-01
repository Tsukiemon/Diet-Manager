import type { NutritionTarget } from "../types";
import { round1 } from "../utils/scoring";

type Props = {
  label: string;
  actual: number;
  target: number;
  unit: string;
  score?: number;
  scoreEnabled?: boolean;
  sensitiveOver?: boolean;
};

export default function NutritionBar({
  label,
  actual,
  target,
  unit,
  score,
  scoreEnabled = true,
  sensitiveOver,
}: Props) {
  const ratio = target > 0 ? actual / target : 0;
  const width = Math.min(140, Math.max(0, ratio * 100));
  const over = ratio > 1;
  const color = over && sensitiveOver ? "bg-coral" : over ? "bg-amberSoft" : "bg-mint";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-stone-700">{label}</span>
        <span className={over && sensitiveOver ? "font-bold text-coral" : "text-stone-600"}>
          {round1(actual)} / {round1(target)} {unit}
          {scoreEnabled && score !== undefined ? `・${round1(score)}点` : "・対象外"}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-200">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
      {over && scoreEnabled && (
        <p className={sensitiveOver ? "text-xs font-semibold text-coral" : "text-xs text-amber-700"}>
          目標を{round1((ratio - 1) * 100)}%超過
        </p>
      )}
      {!scoreEnabled && (
        <p className="text-xs text-stone-500">献立内にこの栄養値が未表示の食品があるため、栄養スコアから除外</p>
      )}
    </div>
  );
}

export const nutritionRows = (target: NutritionTarget) => [
  ["カロリー", "calories", target.calories, "kcal", false],
  ["P", "protein", target.protein, "g", false],
  ["F", "fat", target.fat, "g", false],
  ["C", "carbs", target.carbs, "g", false],
  ["糖質", "sugar", target.sugar, "g", false],
  ["食物繊維", "fiber", target.fiber, "g", false],
  ["塩分", "salt", target.salt, "g", true],
] as const;
