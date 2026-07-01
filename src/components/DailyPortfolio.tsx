import { useMemo } from "react";
import type { DailyPortfolio as DailyPortfolioType, Meal, NutritionTarget, PortfolioSlot, ScoreWeights, Food } from "../types";
import { attachScores, calculateVegetableGrams, round0, round1, vegetableDailyTargetGrams } from "../utils/scoring";
import NutritionBar, { nutritionRows } from "./NutritionBar";

type Props = {
  foods: Food[];
  meals: Meal[];
  portfolio: DailyPortfolioType;
  target: NutritionTarget;
  weights: ScoreWeights;
  onChange: (portfolio: DailyPortfolioType) => void;
};

const slots: Array<{ key: PortfolioSlot; label: string }> = [
  { key: "breakfast", label: "朝" },
  { key: "morningSnack", label: "朝おやつ" },
  { key: "lunch", label: "昼" },
  { key: "afternoonSnack", label: "昼おやつ" },
  { key: "dinner", label: "晩" },
  { key: "otherSnack", label: "その他おやつ" },
  { key: "postWorkoutProtein", label: "筋トレ後プロテイン" },
];

export default function DailyPortfolio({ foods, meals, portfolio, target, weights, onChange }: Props) {
  const mealMap = useMemo(() => new Map(meals.map((meal) => [meal.id, meal])), [meals]);
  const selectedMeals = slots
    .map((slot) => mealMap.get(portfolio[slot.key]))
    .filter((meal): meal is Meal => Boolean(meal));

  const portfolioMeal = useMemo<Meal>(() => {
    const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 4;
    return {
      id: "daily-portfolio",
      name: "1日のポートフォリオ",
      items: selectedMeals.flatMap((meal) => meal.items),
      ease: average(selectedMeals.map((meal) => meal.ease)),
      satisfaction: average(selectedMeals.map((meal) => meal.satisfaction)),
      prepEase: average(selectedMeals.map((meal) => meal.prepEase)),
      memo: "",
      createdAt: new Date().toISOString(),
    };
  }, [selectedMeals]);

  const scored = attachScores([portfolioMeal], foods, target, weights)[0];
  const vegetableGrams = calculateVegetableGrams(portfolioMeal, foods);
  const vegetableRate = (vegetableGrams / vegetableDailyTargetGrams) * 100;

  const setSlot = (slot: PortfolioSlot, mealId: string) => {
    onChange({ ...portfolio, [slot]: mealId });
  };

  const clear = () => {
    onChange({
      breakfast: "",
      morningSnack: "",
      lunch: "",
      afternoonSnack: "",
      dinner: "",
      otherSnack: "",
      postWorkoutProtein: "",
    });
  };

  return (
    <section className="space-y-4">
      <div className="panel space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">1日ポートフォリオ</h2>
            <p className="mt-1 text-sm text-stone-600">各枠に献立を入れて、1日の合計栄養価と食費を確認できます。</p>
          </div>
          <button className="btn-secondary" onClick={clear}>クリア</button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot) => (
            <label className="block space-y-1" key={slot.key}>
              <span className="label">{slot.label}</span>
              <select className="field" value={portfolio[slot.key]} onChange={(event) => setSlot(slot.key, event.target.value)}>
                <option value="">未選択</option>
                {meals.map((meal) => <option key={meal.id} value={meal.id}>{meal.name}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">合計</h3>
            <p className="mt-1 text-sm text-stone-600">
              {selectedMeals.length ? selectedMeals.map((meal) => meal.name).join(" / ") : "献立を選択してください"}
            </p>
          </div>
          <div className="rounded-lg bg-ink px-3 py-2 text-center text-white">
            <div className="text-xs font-semibold">総合</div>
            <div className="text-2xl font-black">{round1(scored.score.totalScore)}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric label="合計食費" value={`${round0(scored.score.totals.price)}円`} />
          <Metric label="kcal" value={`${round0(scored.score.totals.calories)}`} />
          <Metric label="P/F/C" value={`${round1(scored.score.totals.protein)} / ${round1(scored.score.totals.fat)} / ${round1(scored.score.totals.carbs)}`} />
          <Metric label="塩分" value={`${round1(scored.score.totals.salt)}g`} danger={scored.score.scoredNutrients.salt && scored.score.totals.salt > target.salt} />
        </div>

        <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-bold text-emerald-900">野菜摂取量</span>
            <span className="font-bold text-emerald-900">
              {round1(vegetableGrams)} / {vegetableDailyTargetGrams}g ・ {round1(vegetableRate)}%
            </span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-mint" style={{ width: `${Math.min(140, Math.max(0, vegetableRate))}%` }} />
          </div>
          <p className="mt-2 text-xs text-emerald-800">
            野菜は1日単位で評価します。献立ごとのスコアには含めません。
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          {nutritionRows(target).map(([label, key, targetValue, unit, sensitiveOver]) => (
            <NutritionBar
              key={key}
              label={label}
              actual={scored.score.totals[key]}
              target={targetValue}
              unit={unit}
              score={scored.score.nutrientScores[key]}
              scoreEnabled={scored.score.scoredNutrients[key]}
              sensitiveOver={sensitiveOver}
            />
          ))}
        </div>
      </div>
    </section>
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
