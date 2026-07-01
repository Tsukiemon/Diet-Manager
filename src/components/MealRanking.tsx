import { useMemo, useState } from "react";
import type { Food, Meal, MealWithScore, NutritionTarget, RankingFilters, ScoreWeights } from "../types";
import { attachScores, round0, round1 } from "../utils/scoring";
import MealCard from "./MealCard";

type Props = {
  foods: Food[];
  meals: Meal[];
  target: NutritionTarget;
  weights: ScoreWeights;
  onDelete: (id: string) => void;
};

const initialFilters: RankingFilters = {
  tag: "",
  maxPrice: "",
  minProtein: "",
  minCalories: "",
  maxCalories: "",
  needsStaple: false,
  needsVegetable: false,
  convenienceOnly: false,
  includeHomeCooking: false,
  maxSalt: "",
};

export default function MealRanking({ foods, meals, target, weights, onDelete }: Props) {
  const [view, setView] = useState<"card" | "table">("card");
  const [filters, setFilters] = useState(initialFilters);
  const tags = useMemo(() => Array.from(new Set(foods.flatMap((food) => food.tags))).sort(), [foods]);

  const ranked = useMemo(() => {
    return filterMeals(attachScores(meals, foods, target, weights), filters)
      .sort((a, b) => b.score.totalScore - a.score.totalScore);
  }, [filters, foods, meals, target, weights]);

  return (
    <section className="space-y-4">
      <div className="panel space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">献立ランキング</h2>
          <div className="flex rounded-md border border-stone-300 bg-white p-1">
            <button className={`rounded px-3 py-1.5 text-sm font-semibold ${view === "card" ? "bg-ink text-white" : ""}`} onClick={() => setView("card")}>カード</button>
            <button className={`rounded px-3 py-1.5 text-sm font-semibold ${view === "table" ? "bg-ink text-white" : ""}`} onClick={() => setView("table")}>表</button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="店舗タグ" value={filters.tag} onChange={(v) => setFilters({ ...filters, tag: v })} options={["", ...tags]} />
          <NumberField label="価格上限" value={filters.maxPrice} onChange={(v) => setFilters({ ...filters, maxPrice: v })} />
          <NumberField label="最低タンパク質" value={filters.minProtein} onChange={(v) => setFilters({ ...filters, minProtein: v })} />
          <NumberField label="塩分上限" value={filters.maxSalt} onChange={(v) => setFilters({ ...filters, maxSalt: v })} />
          <NumberField label="最小カロリー" value={filters.minCalories} onChange={(v) => setFilters({ ...filters, minCalories: v })} />
          <NumberField label="最大カロリー" value={filters.maxCalories} onChange={(v) => setFilters({ ...filters, maxCalories: v })} />
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Check label="主食あり" checked={filters.needsStaple} onChange={(v) => setFilters({ ...filters, needsStaple: v })} />
          <Check label="野菜あり" checked={filters.needsVegetable} onChange={(v) => setFilters({ ...filters, needsVegetable: v })} />
          <Check label="コンビニのみ" checked={filters.convenienceOnly} onChange={(v) => setFilters({ ...filters, convenienceOnly: v })} />
          <Check label="自炊含む" checked={filters.includeHomeCooking} onChange={(v) => setFilters({ ...filters, includeHomeCooking: v })} />
        </div>
      </div>

      {view === "card" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {ranked.map((meal) => <MealCard key={meal.id} meal={meal} target={target} onDelete={() => onDelete(meal.id)} />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="bg-stone-100 text-xs text-stone-600">
              <tr>
                {["献立", "総合", "栄養", "価格", "継続", "円", "kcal", "P/F/C", "糖質", "繊維", "塩分", "食品"].map((head) => <th className="px-3 py-2" key={head}>{head}</th>)}
              </tr>
            </thead>
            <tbody>
              {ranked.map((meal) => (
                <tr className="border-t border-stone-100" key={meal.id}>
                  <td className="px-3 py-2 font-bold">{meal.name}</td>
                  <td className="px-3 py-2 font-black">{meal.score.totalScore}</td>
                  <td className="px-3 py-2">{meal.score.nutritionScore}</td>
                  <td className="px-3 py-2">{meal.score.priceScore}</td>
                  <td className="px-3 py-2">{meal.score.sustainabilityScore}</td>
                  <td className="px-3 py-2">{round0(meal.score.totals.price)}</td>
                  <td className="px-3 py-2">{formatNutrient(meal, "calories", round0(meal.score.totals.calories))}</td>
                  <td className="px-3 py-2">
                    P{formatNutrient(meal, "protein", round1(meal.score.totals.protein))} F{formatNutrient(meal, "fat", round1(meal.score.totals.fat))} C{formatNutrient(meal, "carbs", round1(meal.score.totals.carbs))}
                  </td>
                  <td className="px-3 py-2">{formatNutrient(meal, "sugar", round1(meal.score.totals.sugar))}</td>
                  <td className="px-3 py-2">{formatNutrient(meal, "fiber", round1(meal.score.totals.fiber))}</td>
                  <td className={`px-3 py-2 font-semibold ${meal.score.scoredNutrients.salt && meal.score.totals.salt > target.salt ? "text-coral" : ""}`}>
                    {formatNutrient(meal, "salt", round1(meal.score.totals.salt))}
                  </td>
                  <td className="px-3 py-2">{meal.foods.map((food) => `${food.name}x${food.quantity}`).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!ranked.length && <div className="panel text-sm text-stone-600">条件に合う献立がありません。</div>}
    </section>
  );
}

function formatNutrient(meal: MealWithScore, key: keyof MealWithScore["score"]["scoredNutrients"], value: number) {
  return meal.score.scoredNutrients[key] ? value : "対象外";
}

export function filterMeals(meals: MealWithScore[], filters: RankingFilters) {
  const hasTag = (meal: MealWithScore, tag: string) => meal.foods.some((food) => food.tags.includes(tag));
  const allConvenience = (meal: MealWithScore) => meal.foods.every((food) => food.tags.includes("コンビニ") || ["セブン", "ローソン", "ファミマ"].some((tag) => food.tags.includes(tag)));
  return meals.filter((meal) => {
    if (filters.tag && !hasTag(meal, filters.tag)) return false;
    if (filters.maxPrice !== "" && meal.score.totals.price > filters.maxPrice) return false;
    if (filters.minProtein !== "" && meal.score.totals.protein < filters.minProtein) return false;
    if (filters.minCalories !== "" && meal.score.totals.calories < filters.minCalories) return false;
    if (filters.maxCalories !== "" && meal.score.totals.calories > filters.maxCalories) return false;
    if (filters.needsStaple && !hasTag(meal, "主食")) return false;
    if (filters.needsVegetable && !hasTag(meal, "野菜")) return false;
    if (filters.convenienceOnly && !allConvenience(meal)) return false;
    if (filters.includeHomeCooking && !hasTag(meal, "自炊")) return false;
    if (filters.maxSalt !== "" && meal.score.totals.salt > filters.maxSalt) return false;
    return true;
  });
}

function NumberField({ label, value, onChange }: { label: string; value: number | ""; onChange: (value: number | "") => void }) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      <input className="field" type="number" min="0" step="0.1" value={value} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option || "all"} value={option}>{option || "すべて"}</option>)}
      </select>
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2">
      <input className="accent-mint" type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="font-semibold">{label}</span>
    </label>
  );
}
