import { useEffect, useMemo, useState } from "react";
import type { Food, Meal, NutritionTarget, ScoreWeights } from "../types";
import { attachScores } from "../utils/scoring";
import MealCard from "./MealCard";

type Props = {
  foods: Food[];
  meals: Meal[];
  target: NutritionTarget;
  weights: ScoreWeights;
  onSave: (meal: Meal) => void;
  onUpdate: (meal: Meal) => void;
  onDelete: (id: string) => void;
};

export default function MealBuilder({ foods, meals, target, weights, onSave, onUpdate, onDelete }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [items, setItems] = useState([{ foodId: foods[0]?.id ?? "", quantity: 1 }]);
  const [ease, setEase] = useState(4);
  const [satisfaction, setSatisfaction] = useState(4);
  const [prepEase, setPrepEase] = useState(4);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (!foods.length || items.some((item) => item.foodId)) return;
    setItems([{ foodId: foods[0]?.id ?? "", quantity: 1 }]);
  }, [foods, items]);

  const preview = useMemo(() => {
    const meal: Meal = {
      id: "preview",
      name: name.trim() || "作成中の献立",
      items: items.filter((item) => item.foodId && item.quantity > 0),
      ease,
      satisfaction,
      prepEase,
      memo,
      createdAt: new Date().toISOString(),
    };
    return attachScores([meal], foods, target, weights)[0];
  }, [ease, foods, items, memo, name, prepEase, satisfaction, target, weights]);

  const addRow = () => setItems((prev) => [...prev, { foodId: foods[0]?.id ?? "", quantity: 1 }]);
  const updateRow = (index: number, key: "foodId" | "quantity", value: string) => {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [key]: key === "quantity" ? Math.max(0.5, Number(value) || 1) : value } : item));
  };
  const removeRow = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const save = () => {
    const validItems = items.filter((item) => item.foodId && item.quantity > 0);
    if (!validItems.length) return;
    const nextMeal: Meal = {
      id: editingId ?? crypto.randomUUID(),
      name: name.trim() || `献立 ${new Date().toLocaleDateString("ja-JP")}`,
      items: validItems,
      ease,
      satisfaction,
      prepEase,
      memo: memo.trim(),
      createdAt: new Date().toISOString(),
    };
    if (editingId) onUpdate(nextMeal);
    else onSave(nextMeal);
    setEditingId(null);
    setName("");
    setItems([{ foodId: foods[0]?.id ?? "", quantity: 1 }]);
    setMemo("");
  };

  const editMeal = (meal: Meal) => {
    setEditingId(meal.id);
    setName(meal.name);
    setItems(meal.items.length ? meal.items : [{ foodId: foods[0]?.id ?? "", quantity: 1 }]);
    setEase(meal.ease);
    setSatisfaction(meal.satisfaction);
    setPrepEase(meal.prepEase);
    setMemo(meal.memo);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setItems([{ foodId: foods[0]?.id ?? "", quantity: 1 }]);
    setEase(4);
    setSatisfaction(4);
    setPrepEase(4);
    setMemo("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="panel space-y-4">
        <h2 className="text-lg font-bold">{editingId ? "献立編集" : "献立作成"}</h2>
        <label className="block space-y-1">
          <span className="label">献立名</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：朝の高タンパクセット" />
        </label>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div className="grid grid-cols-[1fr_82px_42px] gap-2" key={`${index}-${item.foodId}`}>
              <select className="field" value={item.foodId} onChange={(e) => updateRow(index, "foodId", e.target.value)}>
                {foods.map((food) => (
                  <option key={food.id} value={food.id}>{food.name}</option>
                ))}
              </select>
              <input className="field" type="number" min="0.5" step="0.5" value={item.quantity} onChange={(e) => updateRow(index, "quantity", e.target.value)} />
              <button className="btn-secondary px-0" onClick={() => removeRow(index)} type="button">x</button>
            </div>
          ))}
        </div>
        <button className="btn-secondary w-full" onClick={addRow} type="button">食品行を追加</button>
        <div className="grid gap-3 sm:grid-cols-3">
          <Rating label="食べやすさ" value={ease} onChange={setEase} />
          <Rating label="満足度" value={satisfaction} onChange={setSatisfaction} />
          <Rating label="準備の楽さ" value={prepEase} onChange={setPrepEase} />
        </div>
        <label className="block space-y-1">
          <span className="label">メモ</span>
          <textarea className="field min-h-20" value={memo} onChange={(e) => setMemo(e.target.value)} />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="btn-primary flex-1" onClick={save} type="button">{editingId ? "献立を更新" : "献立を保存"}</button>
          {editingId && <button className="btn-secondary" onClick={cancelEdit} type="button">編集をやめる</button>}
        </div>
      </section>

      <div className="space-y-4">
        <MealCard meal={preview} target={target} />
        <section className="panel">
          <h2 className="text-lg font-bold">保存済み献立</h2>
          <div className="mt-3 space-y-2">
            {meals.map((meal) => (
              <div className="flex items-center justify-between gap-3 rounded-md border border-stone-200 p-2" key={meal.id}>
                <span className="text-sm font-semibold">{meal.name}</span>
                <div className="flex gap-1">
                  <button className="rounded-md px-2 py-1 text-xs font-semibold text-mint hover:bg-emerald-50" onClick={() => editMeal(meal)}>編集</button>
                  <button className="rounded-md px-2 py-1 text-xs font-semibold text-coral hover:bg-red-50" onClick={() => onDelete(meal.id)}>削除</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Rating({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}: {value}</span>
      <input className="w-full accent-mint" type="range" min="1" max="5" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
