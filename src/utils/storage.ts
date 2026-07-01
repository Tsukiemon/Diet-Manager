import type { DailyPortfolio, Food, Meal, NutritionTarget, ScoreWeights } from "../types";
import { allNutrientsAvailable, defaultTarget, defaultWeights } from "./scoring";

const keys = {
  foods: "meal-score-foods-v1",
  meals: "meal-score-meals-v1",
  target: "meal-score-target-v1",
  weights: "meal-score-weights-v1",
  portfolio: "meal-score-portfolio-v1",
};

export const defaultPortfolio: DailyPortfolio = {
  breakfast: "",
  morningSnack: "",
  lunch: "",
  afternoonSnack: "",
  dinner: "",
  otherSnack: "",
  postWorkoutProtein: "",
};

export const sampleFoods: Food[] = [
  { id: "food-salad-chicken", name: "サラダチキン", store: "セブン", price: 258, calories: 115, protein: 24.1, fat: 1.8, carbs: 1.2, sugar: 1.0, fiber: 0, salt: 1.4, memo: "調理不要で高タンパク", tags: ["コンビニ", "セブン", "タンパク質", "調理不要"] },
  { id: "food-onigiri-salmon", name: "おにぎり 鮭", store: "コンビニ", price: 168, calories: 180, protein: 4.8, fat: 1.8, carbs: 36, sugar: 35, fiber: 1.2, salt: 1.0, memo: "主食に使いやすい", tags: ["コンビニ", "主食", "調理不要"] },
  { id: "food-onigiri-tuna", name: "おにぎり ツナマヨ", store: "ファミマ", price: 178, calories: 230, protein: 5.0, fat: 8.5, carbs: 34, sugar: 33, fiber: 1.0, salt: 1.2, memo: "脂質はやや高め", tags: ["コンビニ", "ファミマ", "主食", "調理不要"] },
  { id: "food-boiled-egg", name: "ゆで卵", store: "ローソン", price: 98, calories: 75, protein: 6.8, fat: 5.2, carbs: 0.2, sugar: 0.2, fiber: 0, salt: 0.3, memo: "少量のタンパク質追加に", tags: ["コンビニ", "ローソン", "タンパク質", "間食"] },
  { id: "food-protein-drink", name: "プロテインドリンク", store: "ドラッグストア", price: 180, calories: 135, protein: 20.0, fat: 1.0, carbs: 11.0, sugar: 10.0, fiber: 0, salt: 0.2, memo: "外出時の補助", tags: ["プロテイン", "タンパク質", "調理不要"] },
  { id: "food-greek-yogurt", name: "ギリシャヨーグルト", store: "スーパー", price: 160, calories: 100, protein: 10.0, fat: 0.2, carbs: 12.0, sugar: 11.5, fiber: 0, salt: 0.1, memo: "朝食や間食向き", tags: ["スーパー", "タンパク質", "間食"] },
  { id: "food-cut-salad", name: "カットサラダ", store: "コンビニ", price: 138, calories: 35, protein: 1.8, fat: 0.2, carbs: 7.0, sugar: 3.5, fiber: 2.2, salt: 0.1, memo: "野菜を足しやすい", tags: ["コンビニ", "野菜", "調理不要"] },
  { id: "food-natto", name: "納豆", store: "スーパー", price: 45, calories: 90, protein: 7.5, fat: 4.8, carbs: 6.5, sugar: 3.0, fiber: 3.0, salt: 0.4, memo: "安く継続しやすい", tags: ["スーパー", "自炊", "タンパク質"] },
  { id: "food-rice-pack", name: "パックご飯", store: "スーパー", price: 120, calories: 300, protein: 5.0, fat: 0.7, carbs: 67.0, sugar: 66.0, fiber: 0.8, salt: 0, memo: "主食の基準", tags: ["スーパー", "主食", "自炊"] },
  { id: "food-broccoli", name: "冷凍ブロッコリー", store: "スーパー", price: 90, calories: 50, protein: 4.0, fat: 0.6, carbs: 8.0, sugar: 2.0, fiber: 4.5, salt: 0.1, memo: "食物繊維と野菜", tags: ["スーパー", "自炊", "野菜", "冷凍食品"] },
  { id: "food-grilled-fish", name: "焼き魚", store: "スーパー", price: 320, calories: 220, protein: 24.0, fat: 13.0, carbs: 0.5, sugar: 0.2, fiber: 0, salt: 1.6, memo: "塩分に注意", tags: ["スーパー", "自炊", "タンパク質"] },
  { id: "food-soba", name: "そば", store: "スーパー", price: 190, calories: 330, protein: 12.0, fat: 2.0, carbs: 65.0, sugar: 62.0, fiber: 4.0, salt: 2.0, memo: "つゆ込み想定", tags: ["スーパー", "主食", "自炊"] },
  { id: "food-banana", name: "バナナ", store: "スーパー", price: 45, calories: 86, protein: 1.1, fat: 0.2, carbs: 22.5, sugar: 21.4, fiber: 1.1, salt: 0, memo: "手軽な炭水化物", tags: ["スーパー", "間食", "調理不要"] },
  { id: "food-mackerel-can", name: "サバ缶", store: "スーパー", price: 220, calories: 360, protein: 26.8, fat: 28.0, carbs: 0.3, sugar: 0.2, fiber: 0, salt: 1.8, memo: "脂質と塩分は高め", tags: ["スーパー", "タンパク質", "調理不要"] },
  { id: "food-tofu", name: "豆腐", store: "スーパー", price: 80, calories: 170, protein: 14.0, fat: 9.0, carbs: 5.0, sugar: 3.0, fiber: 1.5, salt: 0.1, memo: "低価格のタンパク源", tags: ["スーパー", "自炊", "タンパク質"] },
  { id: "food-egg", name: "卵", store: "スーパー", price: 30, calories: 76, protein: 6.2, fat: 5.2, carbs: 0.2, sugar: 0.2, fiber: 0, salt: 0.2, memo: "1個あたり", tags: ["スーパー", "自炊", "タンパク質"] },
  { id: "food-chicken-breast", name: "鶏むね肉", store: "スーパー", price: 170, calories: 220, protein: 44.0, fat: 4.0, carbs: 0, sugar: 0, fiber: 0, salt: 0.2, memo: "200g想定", tags: ["スーパー", "自炊", "タンパク質"] },
  { id: "food-lowfat-milk", name: "低脂肪乳", store: "スーパー", price: 70, calories: 95, protein: 7.5, fat: 2.0, carbs: 10.0, sugar: 9.5, fiber: 0, salt: 0.2, memo: "200ml想定", tags: ["スーパー", "タンパク質", "調理不要"] },
  { id: "food-brown-rice", name: "玄米パック", store: "スーパー", price: 150, calories: 285, protein: 5.5, fat: 1.8, carbs: 62.0, sugar: 60.0, fiber: 3.0, salt: 0, memo: "食物繊維を足しやすい主食", tags: ["スーパー", "主食", "自炊"] },
  { id: "food-miso-soup", name: "味噌汁", store: "コンビニ", price: 120, calories: 55, protein: 3.0, fat: 1.5, carbs: 7.0, sugar: 4.0, fiber: 1.4, salt: 1.8, memo: "塩分が上がりやすい", tags: ["コンビニ", "自炊", "野菜"] },
];

export const sampleMeals: Meal[] = [
  {
    id: "meal-convenience-balanced",
    name: "コンビニ高タンパクセット",
    items: [
      { foodId: "food-salad-chicken", quantity: 1 },
      { foodId: "food-onigiri-salmon", quantity: 2 },
      { foodId: "food-cut-salad", quantity: 1 },
      { foodId: "food-greek-yogurt", quantity: 1 },
    ],
    ease: 5,
    satisfaction: 4,
    prepEase: 5,
    memo: "外出日の定番候補",
    createdAt: new Date().toISOString(),
  },
  {
    id: "meal-home-bulk",
    name: "自炊むね肉玄米プレート",
    items: [
      { foodId: "food-chicken-breast", quantity: 1 },
      { foodId: "food-brown-rice", quantity: 2 },
      { foodId: "food-broccoli", quantity: 1 },
      { foodId: "food-miso-soup", quantity: 1 },
    ],
    ease: 3,
    satisfaction: 4,
    prepEase: 3,
    memo: "価格と栄養の軸にしやすい",
    createdAt: new Date().toISOString(),
  },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function readArray<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function normalizeFood(food: Food): Food {
  return {
    ...food,
    nutrientAvailability: {
      ...allNutrientsAvailable,
      ...(food.nutrientAvailability ?? {}),
    },
    servingLabel: food.servingLabel ?? "1食",
    inputBasisAmount: food.inputBasisAmount ?? 1,
    inputBasisUnit: food.inputBasisUnit ?? "食",
    packageAmount: food.packageAmount ?? 0,
    packageUnit: food.packageUnit ?? "g",
    packageServings: food.packageServings ?? 0,
    servingUnit: food.servingUnit ?? "食",
    conversionFactor: food.conversionFactor ?? 1,
    vegetableGrams: food.vegetableGrams ?? 0,
    vegetableDailyPortion: food.vegetableDailyPortion ?? 0,
  };
}

export const loadFoods = () => readArray<Food>(keys.foods, sampleFoods).map(normalizeFood);
export const saveFoods = (foods: Food[]) => localStorage.setItem(keys.foods, JSON.stringify(foods));

export const loadMeals = () => readArray<Meal>(keys.meals, sampleMeals);
export const saveMeals = (meals: Meal[]) => localStorage.setItem(keys.meals, JSON.stringify(meals));

export const loadTarget = () => read<NutritionTarget>(keys.target, defaultTarget);
export const saveTarget = (target: NutritionTarget) => localStorage.setItem(keys.target, JSON.stringify(target));

export const loadWeights = () => read<ScoreWeights>(keys.weights, defaultWeights);
export const saveWeights = (weights: ScoreWeights) => localStorage.setItem(keys.weights, JSON.stringify(weights));

export const loadPortfolio = () => read<DailyPortfolio>(keys.portfolio, defaultPortfolio);
export const savePortfolio = (portfolio: DailyPortfolio) => localStorage.setItem(keys.portfolio, JSON.stringify(portfolio));

export const resetAllStorage = () => {
  Object.values(keys).forEach((key) => localStorage.removeItem(key));
};
