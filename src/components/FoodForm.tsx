import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Food, NutrientAvailability, NutrientKey } from "../types";
import { getFoodAvailability, round0, round1, vegetableDailyTargetGrams } from "../utils/scoring";

type Props = {
  onAdd: (food: Food) => void;
  editingFood?: Food | null;
  onUpdate?: (food: Food) => void;
  onCancelEdit?: () => void;
};

const nutrientFields: Array<{ key: NutrientKey; label: string; unit: string }> = [
  { key: "calories", label: "カロリー", unit: "kcal" },
  { key: "protein", label: "タンパク質 P", unit: "g" },
  { key: "fat", label: "脂質 F", unit: "g" },
  { key: "carbs", label: "炭水化物 C", unit: "g" },
  { key: "sugar", label: "糖質", unit: "g" },
  { key: "fiber", label: "食物繊維", unit: "g" },
  { key: "salt", label: "塩分", unit: "g" },
];

const blank = {
  name: "",
  store: "",
  price: "",
  inputBasisAmount: "1",
  inputBasisUnit: "食",
  packageAmount: "",
  packageUnit: "g",
  packageServings: "",
  servingUnit: "食",
  calories: "",
  protein: "",
  fat: "",
  carbs: "",
  sugar: "",
  fiber: "",
  salt: "",
  vegetableGrams: "",
  vegetableDailyPortion: "",
  memo: "",
  tags: "",
};

function foodToForm(food: Food) {
  const availability = getFoodAvailability(food);
  return {
    name: food.name,
    store: food.store,
    price: String(round1(food.price)),
    inputBasisAmount: String(food.inputBasisAmount ?? 1),
    inputBasisUnit: food.inputBasisUnit ?? "食",
    packageAmount: "",
    packageUnit: food.packageUnit ?? "g",
    packageServings: "",
    servingUnit: food.servingUnit ?? "食",
    calories: availability.calories ? String(round1(food.calories)) : "",
    protein: availability.protein ? String(round1(food.protein)) : "",
    fat: availability.fat ? String(round1(food.fat)) : "",
    carbs: availability.carbs ? String(round1(food.carbs)) : "",
    sugar: availability.sugar ? String(round1(food.sugar)) : "",
    fiber: availability.fiber ? String(round1(food.fiber)) : "",
    salt: availability.salt ? String(round1(food.salt)) : "",
    vegetableGrams: food.vegetableGrams ? String(round1(food.vegetableGrams)) : "",
    vegetableDailyPortion: food.vegetableDailyPortion ? String(round1(food.vegetableDailyPortion)) : "",
    memo: food.memo,
    tags: food.tags.join(", "),
  };
}

export default function FoodForm({ onAdd, editingFood, onUpdate, onCancelEdit }: Props) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    setForm(editingFood ? foodToForm(editingFood) : blank);
  }, [editingFood]);

  const set = (key: keyof typeof blank, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const number = (value: string) => Math.max(0, Number(value) || 0);
  const hasPackageConversion =
    number(form.packageAmount) > 0 &&
    number(form.packageServings) > 0 &&
    form.inputBasisUnit.trim() !== "" &&
    form.inputBasisUnit.trim() === form.packageUnit.trim();

  const conversionFactor = useMemo(() => {
    const basis = number(form.inputBasisAmount) || 1;
    if (!hasPackageConversion) return 1;
    return number(form.packageAmount) / number(form.packageServings) / basis;
  }, [form.inputBasisAmount, form.packageAmount, form.packageServings, hasPackageConversion]);

  const priceFactor = number(form.packageServings) > 0 ? 1 / number(form.packageServings) : 1;
  const servingUnit = form.servingUnit.trim() || "食";
  const servingLabel = `1${servingUnit}`;

  const convertedValue = (key: NutrientKey) => {
    const value = form[key];
    return value.trim() === "" ? 0 : number(value) * conversionFactor;
  };
  const convertedVegetableGrams = number(form.vegetableGrams) * conversionFactor;
  const vegetableEquivalentGrams =
    convertedVegetableGrams + number(form.vegetableDailyPortion) * vegetableDailyTargetGrams;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    const nutrientAvailability = nutrientFields.reduce((availability, field) => {
      availability[field.key] = form[field.key].trim() !== "";
      return availability;
    }, {} as NutrientAvailability);

    const nextFood: Food = {
      id: editingFood?.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      store: form.store.trim(),
      price: number(form.price) * priceFactor,
      calories: convertedValue("calories"),
      protein: convertedValue("protein"),
      fat: convertedValue("fat"),
      carbs: convertedValue("carbs"),
      sugar: convertedValue("sugar"),
      fiber: convertedValue("fiber"),
      salt: convertedValue("salt"),
      nutrientAvailability,
      servingLabel,
      inputBasisAmount: number(form.inputBasisAmount) || 1,
      inputBasisUnit: form.inputBasisUnit.trim() || "食",
      packageAmount: number(form.packageAmount),
      packageUnit: form.packageUnit.trim() || "g",
      packageServings: number(form.packageServings),
      servingUnit,
      conversionFactor,
      vegetableGrams: convertedVegetableGrams,
      vegetableDailyPortion: number(form.vegetableDailyPortion),
      memo: form.memo.trim(),
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };
    if (editingFood && onUpdate) {
      onUpdate(nextFood);
    } else {
      onAdd(nextFood);
    }
    setForm(blank);
  };

  return (
    <form className="panel space-y-5" onSubmit={submit}>
      <div>
        <h2 className="text-lg font-bold">{editingFood ? "食品編集" : "食品登録"}</h2>
        <p className="mt-1 text-sm text-stone-600">
          栄養値が表示されていない項目は空欄のままにしてください。0と空欄は別扱いです。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="食品名" value={form.name} onChange={(v) => set("name", v)} required />
        <Field label="店舗名・入手先" value={form.store} onChange={(v) => set("store", v)} />
        <Field label="購入価格 円" type="number" value={form.price} onChange={(v) => set("price", v)} />
        <Field label="タグ カンマ区切り" value={form.tags} onChange={(v) => set("tags", v)} />
      </div>

      <section className="rounded-lg border border-stone-200 bg-stone-50 p-3">
        <h3 className="font-bold">量の換算</h3>
        <p className="mt-1 text-sm text-stone-600">
          例: 400gパックで12個入り、表示が100gあたりなら「入力基準 100 g」「パック総量 400 g」「中身 12 個」にします。
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="入力値の基準量" type="number" value={form.inputBasisAmount} onChange={(v) => set("inputBasisAmount", v)} />
          <Field label="基準単位" value={form.inputBasisUnit} onChange={(v) => set("inputBasisUnit", v)} />
          <Field label="パック総量" type="number" value={form.packageAmount} onChange={(v) => set("packageAmount", v)} />
          <Field label="総量単位" value={form.packageUnit} onChange={(v) => set("packageUnit", v)} />
          <Field label={`中身の数 ${servingUnit}`} type="number" value={form.packageServings} onChange={(v) => set("packageServings", v)} />
          <Field label="食べる単位名" value={form.servingUnit} onChange={(v) => set("servingUnit", v)} />
        </div>
        <div className="mt-3 rounded-md bg-white p-3 text-sm text-stone-700">
          登録単位: <b>{servingLabel}</b> / 換算倍率: <b>{round1(conversionFactor)}</b>
          {number(form.packageServings) > 0 && (
            <> / 登録単位あたり価格: <b>{round0(number(form.price) * priceFactor)}円</b></>
          )}
          {!hasPackageConversion && number(form.packageAmount) > 0 && (
            <p className="mt-1 text-xs font-semibold text-coral">
              入力基準単位とパック総量単位が同じ時だけ、栄養値を自動換算します。
            </p>
          )}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {nutrientFields.map((field) => (
          <Field
            key={field.key}
            label={`${field.label} ${field.unit}`}
            type="number"
            value={form[field.key]}
            onChange={(v) => set(field.key, v)}
            help={form[field.key].trim() === "" ? "未表示として扱う" : `${servingLabel}あたり ${round1(convertedValue(field.key))}${field.unit}`}
          />
        ))}
      </div>

      <section className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
        <h3 className="font-bold">野菜量</h3>
        <p className="mt-1 text-sm text-stone-600">
          献立スコアには入れず、1日ポートフォリオだけで350g目標への達成率を見ます。
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="野菜量 g"
            type="number"
            value={form.vegetableGrams}
            onChange={(v) => set("vegetableGrams", v)}
            help={`${servingLabel}あたり ${round1(convertedVegetableGrams)}g`}
          />
          <Field
            label="1日分の野菜に占める割合"
            type="number"
            value={form.vegetableDailyPortion}
            onChange={(v) => set("vegetableDailyPortion", v)}
            help="例: 1/2日分なら 0.5"
          />
          <div className="rounded-md bg-white p-3 text-sm text-stone-700">
            <div className="text-xs font-semibold text-stone-500">野菜換算</div>
            <div className="mt-1 text-lg font-bold">{round1(vegetableEquivalentGrams)}g</div>
            <div className="text-xs text-stone-500">350g目標の{round1((vegetableEquivalentGrams / vegetableDailyTargetGrams) * 100)}%</div>
          </div>
        </div>
      </section>

      <label className="block space-y-1">
        <span className="label">メモ</span>
        <textarea className="field min-h-20" value={form.memo} onChange={(e) => set("memo", e.target.value)} />
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button className="btn-primary w-full sm:w-auto" type="submit">{editingFood ? "食品を更新" : "食品を追加"}</button>
        {editingFood && (
          <button className="btn-secondary w-full sm:w-auto" type="button" onClick={onCancelEdit}>編集をやめる</button>
        )}
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", required, help }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  help?: string;
}) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      <input className="field" type={type} min="0" step="0.1" required={required} value={value} onChange={(e) => onChange(e.target.value)} />
      {help && <span className="block text-xs text-stone-500">{help}</span>}
    </label>
  );
}
