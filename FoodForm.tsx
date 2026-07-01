import { useState } from "react";
import type { FormEvent } from "react";
import type { Food } from "../types";

type Props = {
  onAdd: (food: Food) => void;
};

const blank = {
  name: "",
  store: "",
  price: "",
  calories: "",
  protein: "",
  fat: "",
  carbs: "",
  sugar: "",
  fiber: "",
  salt: "",
  memo: "",
  tags: "",
};

export default function FoodForm({ onAdd }: Props) {
  const [form, setForm] = useState(blank);

  const set = (key: keyof typeof blank, value: string) => setForm((prev) => ({ ...prev, [key]: value }));
  const number = (value: string) => Math.max(0, Number(value) || 0);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      store: form.store.trim(),
      price: number(form.price),
      calories: number(form.calories),
      protein: number(form.protein),
      fat: number(form.fat),
      carbs: number(form.carbs),
      sugar: number(form.sugar),
      fiber: number(form.fiber),
      salt: number(form.salt),
      memo: form.memo.trim(),
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    });
    setForm(blank);
  };

  return (
    <form className="panel space-y-4" onSubmit={submit}>
      <h2 className="text-lg font-bold">食品登録</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="食品名" value={form.name} onChange={(v) => set("name", v)} required />
        <Field label="店舗名・入手先" value={form.store} onChange={(v) => set("store", v)} />
        <Field label="価格 円" type="number" value={form.price} onChange={(v) => set("price", v)} />
        <Field label="カロリー kcal" type="number" value={form.calories} onChange={(v) => set("calories", v)} />
        <Field label="タンパク質 P g" type="number" value={form.protein} onChange={(v) => set("protein", v)} />
        <Field label="脂質 F g" type="number" value={form.fat} onChange={(v) => set("fat", v)} />
        <Field label="炭水化物 C g" type="number" value={form.carbs} onChange={(v) => set("carbs", v)} />
        <Field label="糖質 g" type="number" value={form.sugar} onChange={(v) => set("sugar", v)} />
        <Field label="食物繊維 g" type="number" value={form.fiber} onChange={(v) => set("fiber", v)} />
        <Field label="塩分 g" type="number" value={form.salt} onChange={(v) => set("salt", v)} />
        <Field label="タグ カンマ区切り" value={form.tags} onChange={(v) => set("tags", v)} />
      </div>
      <label className="block space-y-1">
        <span className="label">メモ</span>
        <textarea className="field min-h-20" value={form.memo} onChange={(e) => set("memo", e.target.value)} />
      </label>
      <button className="btn-primary w-full sm:w-auto" type="submit">食品を追加</button>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", required }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-1">
      <span className="label">{label}</span>
      <input className="field" type={type} min="0" step="0.1" required={required} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
