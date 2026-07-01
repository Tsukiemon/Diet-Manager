import type { NutritionTarget } from "../types";

type Props = {
  target: NutritionTarget;
  onChange: (target: NutritionTarget) => void;
};

export default function TargetSettings({ target, onChange }: Props) {
  const set = (key: keyof NutritionTarget, value: number | boolean) => onChange({ ...target, [key]: value });
  return (
    <section className="panel space-y-4">
      <h2 className="text-lg font-bold">目標設定</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <NumberField label="目標カロリー kcal" value={target.calories} onChange={(v) => set("calories", v)} />
        <NumberField label="目標タンパク質 P g" value={target.protein} onChange={(v) => set("protein", v)} />
        <NumberField label="目標脂質 F g" value={target.fat} onChange={(v) => set("fat", v)} />
        <NumberField label="目標炭水化物 C g" value={target.carbs} onChange={(v) => set("carbs", v)} />
        <NumberField label="目標糖質 g" value={target.sugar} onChange={(v) => set("sugar", v)} />
        <NumberField label="目標食物繊維 g" value={target.fiber} onChange={(v) => set("fiber", v)} />
        <NumberField label="目標塩分 g" value={target.salt} onChange={(v) => set("salt", v)} />
        <NumberField label="安い価格 円" value={target.cheapPrice} onChange={(v) => set("cheapPrice", v)} />
        <NumberField label="高い価格 円" value={target.expensivePrice} onChange={(v) => set("expensivePrice", v)} />
      </div>
      <label className="inline-flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-sm font-semibold">
        <input className="accent-mint" type="checkbox" checked={target.includeSugarInScore} onChange={(e) => set("includeSugarInScore", e.target.checked)} />
        糖質を栄養スコアに含める
      </label>
      {target.expensivePrice <= target.cheapPrice && (
        <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-coral">高い価格は安い価格より大きくしてください。</p>
      )}
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      <input className="field" type="number" min="0" step="0.1" value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} />
    </label>
  );
}
