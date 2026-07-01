import type { MealWithScore, NutritionTarget } from "../types";
import { round0, round1 } from "../utils/scoring";
import NutritionBar, { nutritionRows } from "./NutritionBar";

type Props = {
  meal: MealWithScore;
  target: NutritionTarget;
  onSave?: () => void;
  onDelete?: () => void;
};

export default function MealCard({ meal, target, onSave, onDelete }: Props) {
  const high = meal.score.totalScore >= 80;
  return (
    <article className={`panel ${high ? "border-mint ring-2 ring-mint/15" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">{meal.name}</h3>
          <p className="mt-1 text-sm text-stone-600">
            {meal.foods.map((food) => `${food.name} x${food.quantity}`).join(" / ")}
          </p>
        </div>
        <div className="rounded-lg bg-ink px-3 py-2 text-center text-white">
          <div className="text-xs font-semibold">総合</div>
          <div className="text-2xl font-black">{round1(meal.score.totalScore)}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Metric label="価格" value={`${round0(meal.score.totals.price)}円`} />
        <Metric label="kcal" value={`${round0(meal.score.totals.calories)}`} />
        <Metric label="P/F/C" value={`${round1(meal.score.totals.protein)} / ${round1(meal.score.totals.fat)} / ${round1(meal.score.totals.carbs)}`} />
        <Metric label="塩分" value={`${round1(meal.score.totals.salt)}g`} danger={meal.score.totals.salt > target.salt} />
      </div>

      <div className="mt-4 grid gap-3">
        {nutritionRows(target).map(([label, key, targetValue, unit, sensitiveOver]) => (
          <NutritionBar
            key={key}
            label={label}
            actual={meal.score.totals[key]}
            target={targetValue}
            unit={unit}
            score={meal.score.nutrientScores[key]}
            sensitiveOver={sensitiveOver}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="score-chip bg-emerald-50 text-emerald-800">栄養 {meal.score.nutritionScore}</span>
        <span className="score-chip bg-sky-50 text-sky-800">価格 {meal.score.priceScore}</span>
        <span className="score-chip bg-orange-50 text-orange-800">継続 {meal.score.sustainabilityScore}</span>
        <span className="score-chip bg-stone-100 text-stone-700">糖質 {round1(meal.score.totals.sugar)}g</span>
        <span className="score-chip bg-stone-100 text-stone-700">食物繊維 {round1(meal.score.totals.fiber)}g</span>
      </div>

      {meal.memo && <p className="mt-3 text-sm text-stone-600">{meal.memo}</p>}
      {(onSave || onDelete) && (
        <div className="mt-4 flex gap-2">
          {onSave && <button className="btn-primary flex-1" onClick={onSave}>献立として保存</button>}
          {onDelete && <button className="btn-danger" onClick={onDelete}>削除</button>}
        </div>
      )}
    </article>
  );
}

function Metric({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={`rounded-md border p-2 ${danger ? "border-coral bg-red-50" : "border-stone-200 bg-stone-50"}`}>
      <div className="text-[11px] font-semibold text-stone-500">{label}</div>
      <div className={`text-sm font-bold ${danger ? "text-coral" : "text-ink"}`}>{value}</div>
    </div>
  );
}
