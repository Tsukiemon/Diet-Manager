import { useMemo, useState } from "react";
import type { Food, Meal, NutritionTarget, RankingFilters, ScoreWeights } from "../types";
import { attachScores } from "../utils/scoring";
import { filterMeals } from "./MealRanking";
import MealCard from "./MealCard";

type Props = {
  foods: Food[];
  target: NutritionTarget;
  weights: ScoreWeights;
  onSave: (meal: Meal) => void;
};

const autoFilters: RankingFilters = {
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

export default function AutoMealGenerator({ foods, target, weights, onSave }: Props) {
  const [selected, setSelected] = useState(() => new Set(foods.slice(0, 20).map((food) => food.id)));
  const [maxItems, setMaxItems] = useState(3);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [limit, setLimit] = useState(2500);
  const [filters, setFilters] = useState(autoFilters);
  const selectedFoods = foods.filter((food) => selected.has(food.id)).slice(0, 30);

  const generated = useMemo(() => {
    const meals = generateMeals(selectedFoods, maxItems, allowDuplicates, limit);
    return filterMeals(attachScores(meals, foods, target, weights), filters)
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .slice(0, 50);
  }, [allowDuplicates, filters, foods, limit, maxItems, selectedFoods, target, weights]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="space-y-4">
      <div className="panel space-y-4">
        <h2 className="text-lg font-bold">自動献立生成</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField label="最大食品数" value={maxItems} onChange={(v) => setMaxItems(Math.min(4, Math.max(2, Math.round(v))))} />
          <NumberField label="最大生成件数" value={limit} onChange={(v) => setLimit(Math.min(10000, Math.max(100, Math.round(v))))} />
          <NumberOrEmpty label="価格上限" value={filters.maxPrice} onChange={(v) => setFilters({ ...filters, maxPrice: v })} />
          <NumberOrEmpty label="最低タンパク質" value={filters.minProtein} onChange={(v) => setFilters({ ...filters, minProtein: v })} />
          <NumberOrEmpty label="最小カロリー" value={filters.minCalories} onChange={(v) => setFilters({ ...filters, minCalories: v })} />
          <NumberOrEmpty label="最大カロリー" value={filters.maxCalories} onChange={(v) => setFilters({ ...filters, maxCalories: v })} />
          <NumberOrEmpty label="塩分上限" value={filters.maxSalt} onChange={(v) => setFilters({ ...filters, maxSalt: v })} />
        </div>
        <label className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm font-semibold">
          <input className="accent-mint" type="checkbox" checked={allowDuplicates} onChange={(e) => setAllowDuplicates(e.target.checked)} />
          同じ食品を複数個使う
        </label>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="font-bold">候補に使う食品</h3>
            <span className="text-sm font-semibold text-stone-500">{selected.size}件選択</span>
          </div>
          <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {foods.map((food) => (
              <label className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm" key={food.id}>
                <input className="accent-mint" type="checkbox" checked={selected.has(food.id)} onChange={() => toggle(food.id)} />
                <span className="font-semibold">{food.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {generated.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            target={target}
            onSave={() =>
              onSave({
                id: crypto.randomUUID(),
                name: meal.name,
                items: meal.items,
                ease: meal.ease,
                satisfaction: meal.satisfaction,
                prepEase: meal.prepEase,
                memo: meal.memo,
                createdAt: new Date().toISOString(),
              })
            }
          />
        ))}
      </div>
      {!generated.length && <div className="panel text-sm text-stone-600">生成できる候補がありません。食品選択や条件をゆるめてください。</div>}
    </section>
  );
}

function generateMeals(foods: Food[], maxItems: number, allowDuplicates: boolean, limit: number): Meal[] {
  const meals: Meal[] = [];
  const pushMeal = (items: Array<{ foodId: string; quantity: number }>) => {
    meals.push({
      id: `auto-${meals.length}-${items.map((item) => item.foodId).join("-")}`,
      name: `候補 ${meals.length + 1}`,
      items,
      ease: 4,
      satisfaction: 4,
      prepEase: items.some((item) => foods.find((food) => food.id === item.foodId)?.tags.includes("自炊")) ? 3 : 5,
      memo: "自動生成候補",
      createdAt: new Date().toISOString(),
    });
  };

  const walk = (start: number, combo: string[]) => {
    if (meals.length >= limit) return;
    if (combo.length >= 2) {
      const counts = combo.reduce<Record<string, number>>((acc, id) => {
        acc[id] = (acc[id] ?? 0) + 1;
        return acc;
      }, {});
      pushMeal(Object.entries(counts).map(([foodId, quantity]) => ({ foodId, quantity })));
    }
    if (combo.length >= maxItems) return;
    for (let i = allowDuplicates ? start : start + 1; i < foods.length; i += 1) {
      if (meals.length >= limit) break;
      if (!allowDuplicates && combo.includes(foods[i].id)) continue;
      walk(allowDuplicates ? i : i, [...combo, foods[i].id]);
    }
  };

  for (let i = 0; i < foods.length && meals.length < limit; i += 1) {
    walk(i, [foods[i].id]);
  }
  return meals;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      <input className="field" type="number" min="0" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </label>
  );
}

function NumberOrEmpty({ label, value, onChange }: { label: string; value: number | ""; onChange: (value: number | "") => void }) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      <input className="field" type="number" min="0" step="0.1" value={value} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} />
    </label>
  );
}
