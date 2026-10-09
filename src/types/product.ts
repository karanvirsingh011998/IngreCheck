import type { ExplainedIngredient } from './ingredient';

export type NovaGroup = 1 | 2 | 3 | 4;

export type NutritionRow = {
  key: string;
  label: string;
  display: string;
};

export type NutrientBasis = '100g' | '100ml' | 'serving';

export type ComparableNutrient = {
  key: string;
  label: string;
  amount: number;
  unit: string;
  basis: NutrientBasis;
};

export type AllergenStatus = 'listed' | 'traces_only' | 'missing';

export type Product = {
  code: string;
  name: string;
  brands: string | null;
  imageUrl: string | null;
  categories: string | null;
  countries: string | null;
  ingredientsText: string | null;
  ingredientsTextEn: string | null;
  ingredients: ExplainedIngredient[];
  quantity: string | null;
  recordedLabels: string[];
  nutritionGrade: string | null;
  nutritionBasis: string | null;
  nutrition: NutritionRow[];
  comparableNutrition: ComparableNutrient[];
  allergens: string[];
  traces: string[];
  allergenStatus: AllergenStatus;
  novaGroup: NovaGroup | null;
  sourceUrl: string;
  lastUpdated: string | null;
};

export type LookupFailureCode = 'not_found' | 'network' | 'timeout' | 'malformed' | 'server' | 'rate_limit';

export type LookupResult =
  | { ok: true; product: Product }
  | { ok: false; code: LookupFailureCode; message: string };
