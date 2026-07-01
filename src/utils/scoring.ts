import type {
  Food,
  Meal,
  MealWithScore,
  NutrientAvailability,
  NutrientKey,
  NutritionTarget,
  NutritionTotals,
  ScoreBreakdown,
  ScoreWeights,
} from "../types";

export const nutrientKeys: NutrientKey[] = [
  "calories",
  "protein",
  "fat",
  "carbs",
  "sugar",
  "fiber",
  "salt",
];

export const allNutrientsAvailable: NutrientAvailability = {
  calories: true,
  protein: true,
  fat: true,
  carbs: true,
  sugar: true,
  fiber: true,
  salt: true,
};

export const defaultTarget: NutritionTarget = {
  calories: 2300,
  protein: 120.8,
  fat: 63.9,
  carbs: 310.5,
  sugar: 290.5,
  fiber: 21.0,
  salt: 7.5,
  cheapPrice: 600,
  expensivePrice: 1000,
  includeSugarInScore: false,
};

export const defaultWeights: ScoreWeights = {
  nutrients: {
    calories: 20,
    protein: 35,
    fat: 15,
    carbs: 20,
    sugar: 0,
    fiber: 5,
    salt: 5,
  },
  overall: {
    nutrition: 55,
    price: 30,
    sustainability: 15,
  },
};

export const emptyTotals: NutritionTotals = {
  price: 0,
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  sugar: 0,
  fiber: 0,
  salt: 0,
};

export const clampScore = (value: number) => Math.min(100, Math.max(0, value));

export const round1 = (value: number) => Math.round((value || 0) * 10) / 10;

export const round0 = (value: number) => Math.round(value || 0);

const safeTarget = (target: number) => (target > 0 ? target : 1);

export function normalScore(actual: number, target: number) {
  const base = safeTarget(target);
  return clampScore(100 - (Math.abs(actual - target) / base) * 100);
}

export function proteinScore(actual: number, target: number) {
  const base = safeTarget(target);
  if (actual < target) {
    return clampScore(100 - ((target - actual) / base) * 120);
  }
  return clampScore(100 - ((actual - target) / base) * 40);
}

export function fatScore(actual: number, target: number) {
  const base = safeTarget(target);
  if (actual <= target) {
    return clampScore(100 - ((target - actual) / base) * 60);
  }
  return clampScore(100 - ((actual - target) / base) * 120);
}

export function fiberScore(actual: number, target: number) {
  const base = safeTarget(target);
  if (actual >= target) return 100;
  return clampScore(100 - ((target - actual) / base) * 100);
}

export function saltScore(actual: number, target: number) {
  const base = safeTarget(target);
  if (actual <= target) {
    return clampScore(100 - ((target - actual) / base) * 30);
  }
  return clampScore(100 - ((actual - target) / base) * 150);
}

export function calculatePriceScore(
  price: number,
  cheapPrice: number,
  expensivePrice: number,
) {
  if (price <= cheapPrice) return 100;
  if (price >= expensivePrice) return 0;
  const range = Math.max(1, expensivePrice - cheapPrice);
  return clampScore(100 - ((price - cheapPrice) / range) * 100);
}

export function calculateSustainabilityScore(
  ease: number,
  satisfaction: number,
  prepEase: number,
) {
  const average = ([ease, satisfaction, prepEase].reduce((sum, value) => {
    return sum + clampScore(value * 20) / 20;
  }, 0) /
    3);
  return clampScore((average / 5) * 100);
}

export function calculateTotals(meal: Meal, foods: Food[]): NutritionTotals {
  const foodMap = new Map(foods.map((food) => [food.id, food]));
  return meal.items.reduce<NutritionTotals>((totals, item) => {
    const food = foodMap.get(item.foodId);
    const quantity = Number.isFinite(item.quantity) ? item.quantity : 0;
    if (!food || quantity <= 0) return totals;
    return {
      price: totals.price + food.price * quantity,
      calories: totals.calories + food.calories * quantity,
      protein: totals.protein + food.protein * quantity,
      fat: totals.fat + food.fat * quantity,
      carbs: totals.carbs + food.carbs * quantity,
      sugar: totals.sugar + food.sugar * quantity,
      fiber: totals.fiber + food.fiber * quantity,
      salt: totals.salt + food.salt * quantity,
    };
  }, emptyTotals);
}

export function getFoodAvailability(food: Food): NutrientAvailability {
  return { ...allNutrientsAvailable, ...(food.nutrientAvailability ?? {}) };
}

export function calculateScoredNutrients(meal: Meal, foods: Food[]): NutrientAvailability {
  const foodMap = new Map(foods.map((food) => [food.id, food]));
  const mealFoods = meal.items
    .map((item) => foodMap.get(item.foodId))
    .filter((food): food is Food => Boolean(food));

  if (!mealFoods.length) {
    return { ...allNutrientsAvailable };
  }

  return nutrientKeys.reduce<NutrientAvailability>((result, key) => {
    result[key] = mealFoods.every((food) => getFoodAvailability(food)[key]);
    return result;
  }, { ...allNutrientsAvailable });
}

function weightedAverage(entries: Array<[number, number]>) {
  const totalWeight = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
  if (totalWeight <= 0) return 0;
  return entries.reduce((sum, [score, weight]) => sum + score * Math.max(0, weight), 0) /
    totalWeight;
}

export function calculateScore(
  meal: Meal,
  foods: Food[],
  target: NutritionTarget,
  weights: ScoreWeights,
): ScoreBreakdown {
  const totals = calculateTotals(meal, foods);
  const scoredNutrients = calculateScoredNutrients(meal, foods);
  const nutrientScores = {
    calories: normalScore(totals.calories, target.calories),
    protein: proteinScore(totals.protein, target.protein),
    fat: fatScore(totals.fat, target.fat),
    carbs: normalScore(totals.carbs, target.carbs),
    sugar: normalScore(totals.sugar, target.sugar),
    fiber: fiberScore(totals.fiber, target.fiber),
    salt: saltScore(totals.salt, target.salt),
  };

  const nutritionEntries: Array<[number, number]> = [
    ...(scoredNutrients.calories ? [[nutrientScores.calories, weights.nutrients.calories] as [number, number]] : []),
    ...(scoredNutrients.protein ? [[nutrientScores.protein, weights.nutrients.protein] as [number, number]] : []),
    ...(scoredNutrients.fat ? [[nutrientScores.fat, weights.nutrients.fat] as [number, number]] : []),
    ...(scoredNutrients.carbs ? [[nutrientScores.carbs, weights.nutrients.carbs] as [number, number]] : []),
    ...(scoredNutrients.fiber ? [[nutrientScores.fiber, weights.nutrients.fiber] as [number, number]] : []),
    ...(scoredNutrients.salt ? [[nutrientScores.salt, weights.nutrients.salt] as [number, number]] : []),
  ];

  if (target.includeSugarInScore && scoredNutrients.sugar) {
    nutritionEntries.push([nutrientScores.sugar, weights.nutrients.sugar]);
  }

  const nutritionScore = weightedAverage(nutritionEntries);
  const priceScore = calculatePriceScore(
    totals.price,
    target.cheapPrice,
    target.expensivePrice,
  );
  const sustainabilityScore = calculateSustainabilityScore(
    meal.ease,
    meal.satisfaction,
    meal.prepEase,
  );
  const totalScore = weightedAverage([
    [nutritionScore, weights.overall.nutrition],
    [priceScore, weights.overall.price],
    [sustainabilityScore, weights.overall.sustainability],
  ]);

  return {
    nutrientScores,
    scoredNutrients,
    nutritionScore: round1(nutritionScore),
    priceScore: round1(priceScore),
    sustainabilityScore: round1(sustainabilityScore),
    totalScore: round1(totalScore),
    totals: {
      price: round0(totals.price),
      calories: round0(totals.calories),
      protein: round1(totals.protein),
      fat: round1(totals.fat),
      carbs: round1(totals.carbs),
      sugar: round1(totals.sugar),
      fiber: round1(totals.fiber),
      salt: round1(totals.salt),
    },
  };
}

export function attachScores(
  meals: Meal[],
  foods: Food[],
  target: NutritionTarget,
  weights: ScoreWeights,
): MealWithScore[] {
  const foodMap = new Map(foods.map((food) => [food.id, food]));
  return meals.map((meal) => ({
    ...meal,
    score: calculateScore(meal, foods, target, weights),
    foods: meal.items
      .map((item) => {
        const food = foodMap.get(item.foodId);
        return food ? { ...food, quantity: item.quantity } : undefined;
      })
      .filter((food): food is Food & { quantity: number } => Boolean(food)),
  }));
}
