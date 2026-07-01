import type { Food } from "../types";
import { getFoodAvailability, round0, round1 } from "../utils/scoring";

type Props = {
  foods: Food[];
  onEdit: (food: Food) => void;
  onDelete: (id: string) => void;
};

export default function FoodList({ foods, onEdit, onDelete }: Props) {
  return (
    <div className="panel">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">食品一覧</h2>
        <span className="text-sm font-semibold text-stone-500">{foods.length}件</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {foods.map((food) => (
          <div className="rounded-lg border border-stone-200 p-3" key={food.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{food.name}</h3>
                <p className="text-xs text-stone-500">{food.store || "入手先未設定"}</p>
              </div>
              <div className="flex gap-1">
                <button className="rounded-md px-2 py-1 text-xs font-semibold text-mint hover:bg-emerald-50" onClick={() => onEdit(food)}>
                  編集
                </button>
                <button className="rounded-md px-2 py-1 text-xs font-semibold text-coral hover:bg-red-50" onClick={() => onDelete(food.id)}>
                  削除
                </button>
              </div>
            </div>
            <div className="mt-2 text-sm font-semibold">
              {food.servingLabel ?? "1食"}あたり {round0(food.price)}円 / {round0(food.calories)}kcal / P{round1(food.protein)} F{round1(food.fat)} C{round1(food.carbs)}
            </div>
            <MissingNutrients food={food} />
            <div className="mt-2 flex flex-wrap gap-1">
              {food.tags.map((tag) => (
                <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-700" key={tag}>{tag}</span>
              ))}
            </div>
            {food.memo && <p className="mt-2 text-xs text-stone-600">{food.memo}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MissingNutrients({ food }: { food: Food }) {
  const availability = getFoodAvailability(food);
  const missing = ([
    ["カロリー", availability.calories],
    ["P", availability.protein],
    ["F", availability.fat],
    ["C", availability.carbs],
    ["糖質", availability.sugar],
    ["食物繊維", availability.fiber],
    ["塩分", availability.salt],
  ] as Array<[string, boolean]>).filter(([, available]) => !available).map(([label]) => label);

  if (!missing.length) return null;

  return (
    <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
      未表示: {missing.join("、")}
    </p>
  );
}
