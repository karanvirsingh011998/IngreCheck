import type { ComparableNutrient, NutrientBasis, Product } from '../types/product';
import { NOVA_DESCRIPTIONS } from './nova';
import { normalizeIngredientName } from './matchIngredient';
import { matchPreferenceFlags, preferenceNote, type PreferenceType } from './preferences';

export const COMPARISON_SAFETY_NOTICE =
  'Product information may be incomplete or outdated. Always check the physical packaging, especially if you have a food allergy.';

export const COMPARISON_INSUFFICIENT =
  'The available data is insufficient for a meaningful comparison.';

export const INGREDIENT_DIFFERENCE_CAVEAT =
  'A name recorded for only one product does not prove that ingredient is absent from the other product.';

export const NOVA_PROCESSING_NOTE =
  'NOVA classifies processing. It does not measure overall nutritional quality or whether a product suits a particular person.';

export const COVERAGE_NOTE =
  'Data completeness describes how much of the record is filled in. It does not measure product safety or overall quality. Missing allergen information does not mean the product has no allergens.';

const NOT_AVAILABLE = 'Not available';

export type CoverageLevel = 'good' | 'partial' | 'limited';

export type CoverageReport = {
  level: CoverageLevel;
  present: string[];
  missing: string[];
};

export type IngredientComparison = {
  originalA: string | null;
  originalB: string | null;
  englishA: string | null;
  englishB: string | null;
  shared: string[];
  onlyA: string[];
  onlyB: string[];
  comparable: boolean;
};

export type NutritionComparisonRow = {
  label: string;
  unit: string;
  valueA: string;
  valueB: string;
  statement: string | null;
};

export type PreferenceHit = {
  ingredientText: string;
  preferenceType: PreferenceType;
  note: string;
};

export type ProductComparison = {
  ingredients: IngredientComparison;
  nutrition: NutritionComparisonRow[];
  allergensA: string[];
  tracesA: string[];
  allergensMissingA: boolean;
  allergensB: string[];
  tracesB: string[];
  allergensMissingB: boolean;
  novaA: string | null;
  novaB: string | null;
  coverageA: CoverageReport;
  coverageB: CoverageReport;
  insightsA: string[];
  insightsB: string[];
  preferencesA: PreferenceHit[];
  preferencesB: PreferenceHit[];
  summary: string[];
};

type PreferenceInput = readonly { ingredientName: string; preferenceType: PreferenceType }[];

type IngredientKey = {
  key: string;
  label: string;
};

function formatAmount(value: number): string {
  if (value === 0) {
    return '0';
  }
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : value >= 1 ? 2 : 3;
  return String(Number(value.toFixed(digits)));
}

function basisPhrase(basis: NutrientBasis): string {
  if (basis === '100ml') {
    return 'per 100 ml';
  }
  if (basis === 'serving') {
    return 'per serving';
  }
  return 'per 100 g';
}

function displayValue(nutrient: ComparableNutrient | undefined): string {
  if (!nutrient) {
    return NOT_AVAILABLE;
  }
  return `${formatAmount(nutrient.amount)} ${nutrient.unit} ${basisPhrase(nutrient.basis)}`;
}

function ingredientKeys(product: Product): IngredientKey[] {
  const seen = new Set<string>();
  const keys: IngredientKey[] = [];
  for (const item of product.ingredients) {
    const normalized = normalizeIngredientName(item.text);
    if (!normalized) {
      continue;
    }
    const key = item.match.status === 'matched' ? `id:${item.match.entry.id}` : `text:${normalized}`;
    const label = item.match.status === 'matched' ? item.match.entry.name : item.text;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    keys.push({ key, label });
  }
  return keys;
}

function compareIngredients(a: Product, b: Product): IngredientComparison {
  const originalA = a.ingredientsText;
  const originalB = b.ingredientsText;
  const comparable = Boolean(originalA || a.ingredients.length > 0) && Boolean(originalB || b.ingredients.length > 0);
  if (!comparable) {
    return {
      originalA,
      originalB,
      englishA: a.ingredientsTextEn,
      englishB: b.ingredientsTextEn,
      shared: [],
      onlyA: [],
      onlyB: [],
      comparable: false,
    };
  }
  const keysA = ingredientKeys(a);
  const keysB = ingredientKeys(b);
  const setB = new Set(keysB.map((item) => item.key));
  const setA = new Set(keysA.map((item) => item.key));
  return {
    originalA,
    originalB,
    englishA: a.ingredientsTextEn,
    englishB: b.ingredientsTextEn,
    shared: keysA.filter((item) => setB.has(item.key)).map((item) => item.label),
    onlyA: keysA.filter((item) => !setB.has(item.key)).map((item) => item.label),
    onlyB: keysB.filter((item) => !setA.has(item.key)).map((item) => item.label),
    comparable: true,
  };
}

const NUTRITION_ORDER = [
  'energy-kcal',
  'energy-kj',
  'sugars',
  'fat',
  'saturated-fat',
  'carbohydrates',
  'proteins',
  'fiber',
  'salt',
  'sodium',
];

const NUTRITION_LABELS: Record<string, { label: string; unit: string }> = {
  'energy-kcal': { label: 'Energy', unit: 'kcal' },
  'energy-kj': { label: 'Energy', unit: 'kJ' },
  sugars: { label: 'Sugars', unit: 'g' },
  fat: { label: 'Total fat', unit: 'g' },
  'saturated-fat': { label: 'Saturated fat', unit: 'g' },
  carbohydrates: { label: 'Carbohydrates', unit: 'g' },
  proteins: { label: 'Protein', unit: 'g' },
  fiber: { label: 'Fibre', unit: 'g' },
  salt: { label: 'Salt', unit: 'g' },
  sodium: { label: 'Sodium', unit: 'g' },
};

function nutrientStatement(label: string, unit: string, left: ComparableNutrient, right: ComparableNutrient): string | null {
  if (left.unit !== right.unit || left.basis !== right.basis) {
    return `${label} cannot be compared because the records use different units or serving sizes.`;
  }
  const basis = basisPhrase(left.basis);
  const plain = label === 'Sugars' ? 'sugar' : label.toLowerCase();
  const name = unit === 'g' ? plain : `${plain} in ${unit}`;
  if (left.amount === right.amount) {
    return `Product A and Product B list the same amount of ${name} ${basis}.`;
  }
  const higher = left.amount > right.amount ? 'Product A' : 'Product B';
  return `${higher} has more ${name} ${basis}.`;
}

function compareNutrition(a: Product, b: Product): NutritionComparisonRow[] {
  const mapA = new Map((a.comparableNutrition ?? []).map((item) => [item.key, item]));
  const mapB = new Map((b.comparableNutrition ?? []).map((item) => [item.key, item]));
  return NUTRITION_ORDER.map((key) => {
    const meta = NUTRITION_LABELS[key];
    const left = mapA.get(key);
    const right = mapB.get(key);
    return {
      label: meta.label,
      unit: meta.unit,
      valueA: displayValue(left),
      valueB: displayValue(right),
      statement: left && right ? nutrientStatement(meta.label, meta.unit, left, right) : null,
    };
  });
}

function coverage(product: Product): CoverageReport {
  const checks: { label: string; present: boolean }[] = [
    { label: 'Product name', present: product.name.trim().length > 0 && product.name !== 'Unnamed product' },
    { label: 'Ingredients', present: Boolean(product.ingredientsText) || product.ingredients.length > 0 },
    { label: 'Nutrition values', present: (product.comparableNutrition ?? []).length > 0 },
    { label: 'Allergen information', present: product.allergenStatus !== 'missing' },
    { label: 'NOVA classification', present: product.novaGroup !== null },
  ];
  const present = checks.filter((item) => item.present).map((item) => item.label);
  const missing = checks.filter((item) => !item.present).map((item) => item.label);
  const level: CoverageLevel = present.length >= 5 ? 'good' : present.length >= 3 ? 'partial' : 'limited';
  return { level, present, missing };
}

function insights(product: Product): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();
  let unknown = 0;
  for (const item of product.ingredients) {
    if (item.match.status === 'matched') {
      if (seen.has(item.match.entry.id)) {
        continue;
      }
      seen.add(item.match.entry.id);
      lines.push(`${item.match.entry.name}: ${item.match.entry.explanation}`);
    } else if (item.match.status === 'unknown') {
      unknown += 1;
    }
  }
  if (unknown > 0) {
    lines.push(`Explanation not available for ${unknown} recorded name${unknown === 1 ? '' : 's'}.`);
  }
  return lines;
}

function preferenceHits(product: Product, preferences: PreferenceInput): PreferenceHit[] {
  return matchPreferenceFlags(
    product.ingredients.map((item) => item.text),
    preferences,
  ).map((flag) => ({
    ingredientText: flag.ingredientText,
    preferenceType: flag.preferenceType,
    note: preferenceNote(flag.preferenceType),
  }));
}

function novaLine(product: Product): string | null {
  if (!product.novaGroup) {
    return null;
  }
  return `NOVA ${product.novaGroup} — ${NOVA_DESCRIPTIONS[product.novaGroup].replace(/\.$/, '')}`;
}

export function compareProducts(a: Product, b: Product, preferences: PreferenceInput = []): ProductComparison {
  const ingredients = compareIngredients(a, b);
  const nutrition = compareNutrition(a, b);
  const coverageA = coverage(a);
  const coverageB = coverage(b);
  const summary: string[] = [];

  for (const row of nutrition) {
    if (row.statement) {
      summary.push(row.statement);
    }
  }
  for (const name of ingredients.shared) {
    summary.push(`Both records list ${name}.`);
  }
  if (a.allergenStatus === 'missing' || b.allergenStatus === 'missing') {
    const which =
      a.allergenStatus === 'missing' && b.allergenStatus === 'missing'
        ? 'both products'
        : a.allergenStatus === 'missing'
          ? 'Product A'
          : 'Product B';
    summary.push(`Allergen information is unavailable for ${which}.`);
  }
  if ((a.novaGroup === null) !== (b.novaGroup === null)) {
    summary.push('NOVA classification is available for only one product.');
  }
  if (summary.length === 0) {
    summary.push(COMPARISON_INSUFFICIENT);
  }

  return {
    ingredients,
    nutrition,
    allergensA: a.allergens,
    tracesA: a.traces,
    allergensMissingA: a.allergenStatus === 'missing',
    allergensB: b.allergens,
    tracesB: b.traces,
    allergensMissingB: b.allergenStatus === 'missing',
    novaA: novaLine(a),
    novaB: novaLine(b),
    coverageA,
    coverageB,
    insightsA: insights(a),
    insightsB: insights(b),
    preferencesA: preferenceHits(a, preferences),
    preferencesB: preferenceHits(b, preferences),
    summary,
  };
}
