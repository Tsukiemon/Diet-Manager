import { useEffect, useMemo, useState } from "react";
import AutoMealGenerator from "./components/AutoMealGenerator";
import DailyPortfolio from "./components/DailyPortfolio";
import FoodForm from "./components/FoodForm";
import FoodList from "./components/FoodList";
import MealBuilder from "./components/MealBuilder";
import MealRanking from "./components/MealRanking";
import ScoreSettings from "./components/ScoreSettings";
import TargetSettings from "./components/TargetSettings";
import type { Food, Meal } from "./types";
import { attachScores, defaultTarget, defaultWeights } from "./utils/scoring";
import {
  loadFoods,
  loadMeals,
  loadPortfolio,
  loadTarget,
  loadWeights,
  resetAllStorage,
  saveFoods,
  saveMeals,
  savePortfolio,
  saveTarget,
  saveWeights,
  sampleFoods,
  sampleMeals,
} from "./utils/storage";

type Tab = "foods" | "builder" | "ranking" | "settings" | "auto" | "portfolio";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "ranking", label: "ランキング" },
  { id: "portfolio", label: "1日ポートフォリオ" },
  { id: "builder", label: "献立作成" },
  { id: "auto", label: "自動生成" },
  { id: "foods", label: "食品登録" },
  { id: "settings", label: "設定" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("ranking");
  const [foods, setFoods] = useState(() => loadFoods());
  const [meals, setMeals] = useState(() => loadMeals());
  const [portfolio, setPortfolio] = useState(() => loadPortfolio());
  const [target, setTarget] = useState(() => loadTarget());
  const [weights, setWeights] = useState(() => loadWeights());
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const topMeal = useMemo(() => {
    return attachScores(meals, foods, target, weights).sort((a, b) => b.score.totalScore - a.score.totalScore)[0];
  }, [foods, meals, target, weights]);

  useEffect(() => saveFoods(foods), [foods]);
  useEffect(() => saveMeals(meals), [meals]);
  useEffect(() => savePortfolio(portfolio), [portfolio]);
  useEffect(() => saveTarget(target), [target]);
  useEffect(() => saveWeights(weights), [weights]);

  const addFood = (food: Food) => setFoods((prev) => [food, ...prev]);
  const updateFood = (food: Food) => {
    setFoods((prev) => prev.map((item) => item.id === food.id ? food : item));
    setEditingFood(null);
  };
  const deleteFood = (id: string) => {
    setFoods((prev) => prev.filter((food) => food.id !== id));
    setMeals((prev) => prev.map((meal) => ({ ...meal, items: meal.items.filter((item) => item.foodId !== id) })));
  };
  const addMeal = (meal: Meal) => setMeals((prev) => [meal, ...prev]);
  const updateMeal = (meal: Meal) => setMeals((prev) => prev.map((item) => item.id === meal.id ? meal : item));
  const deleteMeal = (id: string) => setMeals((prev) => prev.filter((meal) => meal.id !== id));

  const reset = () => {
    resetAllStorage();
    setFoods(sampleFoods);
    setMeals(sampleMeals);
    setTarget(defaultTarget);
    setWeights(defaultWeights);
  };

  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-normal text-ink">献立スコアリング</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
                筋トレ・健康管理・食費管理のために、目標栄養価への近さ、価格、続けやすさで献立を評価します。
              </p>
            </div>
            {topMeal && (
              <div className="rounded-lg border border-mint/30 bg-emerald-50 px-4 py-3">
                <div className="text-xs font-bold text-emerald-700">現在の最高スコア</div>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-sm font-bold text-ink">{topMeal.name}</span>
                  <span className="rounded-md bg-mint px-2 py-1 text-sm font-black text-white">{topMeal.score.totalScore}</span>
                </div>
              </div>
            )}
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                className={`min-h-10 shrink-0 rounded-md px-4 text-sm font-bold transition ${
                  activeTab === tab.id ? "bg-ink text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        {activeTab === "foods" && (
          <div className="space-y-4">
            <FoodForm onAdd={addFood} editingFood={editingFood} onUpdate={updateFood} onCancelEdit={() => setEditingFood(null)} />
            <FoodList foods={foods} onEdit={setEditingFood} onDelete={deleteFood} />
          </div>
        )}

        {activeTab === "builder" && (
          <MealBuilder
            foods={foods}
            meals={meals}
            target={target}
            weights={weights}
            onSave={addMeal}
            onUpdate={updateMeal}
            onDelete={deleteMeal}
          />
        )}

        {activeTab === "portfolio" && (
          <DailyPortfolio
            foods={foods}
            meals={meals}
            portfolio={portfolio}
            target={target}
            weights={weights}
            onChange={setPortfolio}
          />
        )}

        {activeTab === "ranking" && (
          <MealRanking foods={foods} meals={meals} target={target} weights={weights} onDelete={deleteMeal} />
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <TargetSettings target={target} onChange={setTarget} />
            <ScoreSettings weights={weights} includeSugar={target.includeSugarInScore} onChange={setWeights} />
            <div className="panel">
              <button className="btn-secondary" onClick={reset}>サンプルデータと初期設定に戻す</button>
            </div>
          </div>
        )}

        {activeTab === "auto" && (
          <AutoMealGenerator foods={foods} target={target} weights={weights} onSave={addMeal} />
        )}
      </main>
    </div>
  );
}
