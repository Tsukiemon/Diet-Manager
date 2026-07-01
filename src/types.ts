export type NutrientKey =
  | "calories"
  | "protein"
  | "fat"
  | "carbs"
  | "sugar"
  | "fiber"
  | "salt";

export type NutrientAvailability = Record<NutrientKey, boolean>;

export type Food = {
  id: string;
  name: string;
  store: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  salt: number;
  nutrientAvailability?: NutrientAvailability;
  servingLabel?: string;
  inputBasisAmount?: number;
  inputBasisUnit?: string;
  packageAmount?: number;
  packageUnit?: string;
  packageServings?: number;
  servingUnit?: string;
  conversionFactor?: number;
  vegetableGrams?: number;
  vegetableDailyPortion?: number;
  memo: string;
  tags: string[];
};

export type MealItem = {
  foodId: string;
  quantity: number;
};

export type Meal = {
  id: string;
  name: string;
  items: MealItem[];
  ease: number;
  satisfaction: number;
  prepEase: number;
  memo: string;
  createdAt: string;
};

export type NutritionTarget = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  salt: number;
  cheapPrice: number;
  expensivePrice: number;
  includeSugarInScore: boolean;
};

export type NutrientWeights = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  salt: number;
};

export type OverallWeights = {
  nutrition: number;
  price: number;
  sustainability: number;
};

export type ScoreWeights = {
  nutrients: NutrientWeights;
  overall: OverallWeights;
};

export type NutritionTotals = {
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  salt: number;
};

export type ScoreBreakdown = {
  nutrientScores: NutrientWeights;
  scoredNutrients: NutrientAvailability;
  nutritionScore: number;
  priceScore: number;
  sustainabilityScore: number;
  totalScore: number;
  totals: NutritionTotals;
};

export type MealWithScore = Meal & {
  score: ScoreBreakdown;
  foods: Array<Food & { quantity: number }>;
};

export type PortfolioSlot =
  | "breakfast"
  | "morningSnack"
  | "lunch"
  | "afternoonSnack"
  | "dinner"
  | "otherSnack"
  | "postWorkoutProtein";

export type DailyPortfolio = Record<PortfolioSlot, string>;

export type RankingFilters = {
  tag: string;
  maxPrice: number | "";
  minProtein: number | "";
  minCalories: number | "";
  maxCalories: number | "";
  needsStaple: boolean;
  needsVegetable: boolean;
  convenienceOnly: boolean;
  includeHomeCooking: boolean;
  maxSalt: number | "";
};
