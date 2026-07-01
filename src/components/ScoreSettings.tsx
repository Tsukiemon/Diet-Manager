import type { ScoreWeights } from "../types";

type Props = {
  weights: ScoreWeights;
  includeSugar: boolean;
  onChange: (weights: ScoreWeights) => void;
};

export default function ScoreSettings({ weights, includeSugar, onChange }: Props) {
  const nutrientTotal =
    weights.nutrients.calories +
    weights.nutrients.protein +
    weights.nutrients.fat +
    weights.nutrients.carbs +
    weights.nutrients.fiber +
    weights.nutrients.salt +
    (includeSugar ? weights.nutrients.sugar : 0);
  const overallTotal = weights.overall.nutrition + weights.overall.price + weights.overall.sustainability;

  const setNutrient = (key: keyof ScoreWeights["nutrients"], value: number) => {
    onChange({ ...weights, nutrients: { ...weights.nutrients, [key]: value } });
  };
  const setOverall = (key: keyof ScoreWeights["overall"], value: number) => {
    onChange({ ...weights, overall: { ...weights.overall, [key]: value } });
  };

  return (
    <section className="panel space-y-5">
      <div>
        <h2 className="text-lg font-bold">重み設定</h2>
        <p className="mt-1 text-sm text-stone-600">総合スコアと栄養スコアの重みを調整できます。</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold">総合スコア重み</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <WeightField label="栄養スコア %" value={weights.overall.nutrition} onChange={(v) => setOverall("nutrition", v)} />
          <WeightField label="価格スコア %" value={weights.overall.price} onChange={(v) => setOverall("price", v)} />
          <WeightField label="継続性スコア %" value={weights.overall.sustainability} onChange={(v) => setOverall("sustainability", v)} />
        </div>
        <TotalWarning total={overallTotal} />
      </div>

      <div className="space-y-3">
        <h3 className="font-bold">栄養スコア重み</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <WeightField label="カロリー %" value={weights.nutrients.calories} onChange={(v) => setNutrient("calories", v)} />
          <WeightField label="タンパク質 %" value={weights.nutrients.protein} onChange={(v) => setNutrient("protein", v)} />
          <WeightField label="脂質 %" value={weights.nutrients.fat} onChange={(v) => setNutrient("fat", v)} />
          <WeightField label="炭水化物 %" value={weights.nutrients.carbs} onChange={(v) => setNutrient("carbs", v)} />
          {includeSugar && <WeightField label="糖質 %" value={weights.nutrients.sugar} onChange={(v) => setNutrient("sugar", v)} />}
          <WeightField label="食物繊維 %" value={weights.nutrients.fiber} onChange={(v) => setNutrient("fiber", v)} />
          <WeightField label="塩分 %" value={weights.nutrients.salt} onChange={(v) => setNutrient("salt", v)} />
        </div>
        <TotalWarning total={nutrientTotal} />
      </div>
    </section>
  );
}

function WeightField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      <input className="field" type="number" min="0" max="100" step="1" value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} />
    </label>
  );
}

function TotalWarning({ total }: { total: number }) {
  const ok = Math.abs(total - 100) < 0.01;
  return (
    <p className={`rounded-md p-3 text-sm font-semibold ${ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-coral"}`}>
      合計: {total}% {ok ? "OK" : "合計が100%になるように調整してください。"}
    </p>
  );
}
