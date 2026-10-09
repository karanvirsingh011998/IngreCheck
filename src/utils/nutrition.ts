import type { ComparableNutrient, NutrientBasis, NutritionRow } from '../types/product';

type NutrientSpec = {
  key: string;
  label: string;
  unit: string;
};

const NUTRIENTS: NutrientSpec[] = [
  { key: 'energy', label: 'Energy', unit: 'kcal' },
  { key: 'fat', label: 'Total fat', unit: 'g' },
  { key: 'saturated-fat', label: 'Saturated fat', unit: 'g' },
  { key: 'carbohydrates', label: 'Carbohydrates', unit: 'g' },
  { key: 'sugars', label: 'Sugars', unit: 'g' },
  { key: 'fiber', label: 'Fibre', unit: 'g' },
  { key: 'proteins', label: 'Protein', unit: 'g' },
  { key: 'salt', label: 'Salt', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'g' },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function formatQuantity(value: number): string {
  if (value === 0) {
    return '0';
  }
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : value >= 1 ? 2 : 3;
  return String(Number(value.toFixed(digits)));
}

function basisLabel(nutritionDataPer: unknown, usedServing: boolean): string | null {
  if (usedServing) {
    return 'Per serving';
  }
  if (nutritionDataPer === '100ml') {
    return 'Per 100 ml';
  }
  if (nutritionDataPer === '100g' || nutritionDataPer === '100 g') {
    return 'Per 100 g';
  }
  return 'Per 100 g';
}

function readField(nutriments: Record<string, unknown>, key: string, suffix: '100g' | 'serving'): number | null {
  if (key === 'fiber') {
    return readNumber(nutriments[`fiber_${suffix}`]) ?? readNumber(nutriments[`fibre_${suffix}`]);
  }
  return readNumber(nutriments[`${key}_${suffix}`]);
}

function energyDisplay(nutriments: Record<string, unknown>, suffix: '100g' | 'serving'): string | null {
  const kcal = readNumber(nutriments[`energy-kcal_${suffix}`]);
  const kj = readNumber(nutriments[`energy-kj_${suffix}`]);
  if (kcal === null && kj === null) {
    return null;
  }
  if (kcal !== null && kj !== null) {
    return `${formatQuantity(kcal)} kcal · ${formatQuantity(kj)} kJ`;
  }
  if (kcal !== null) {
    return `${formatQuantity(kcal)} kcal`;
  }
  return `${formatQuantity(kj as number)} kJ`;
}

export function buildNutrition(nutrimentsValue: unknown, nutritionDataPer: unknown): {
  basis: string | null;
  rows: NutritionRow[];
} {
  if (!isRecord(nutrimentsValue)) {
    return { basis: null, rows: [] };
  }

  const hasPer100 = NUTRIENTS.some((nutrient) => {
    if (nutrient.key === 'energy') {
      return energyDisplay(nutrimentsValue, '100g') !== null;
    }
    return readField(nutrimentsValue, nutrient.key, '100g') !== null;
  });
  const suffix: '100g' | 'serving' = hasPer100 ? '100g' : 'serving';
  const rows: NutritionRow[] = [];

  for (const nutrient of NUTRIENTS) {
    if (nutrient.key === 'energy') {
      const display = energyDisplay(nutrimentsValue, suffix);
      if (display) {
        rows.push({ key: nutrient.key, label: nutrient.label, display });
      }
      continue;
    }
    const amount = readField(nutrimentsValue, nutrient.key, suffix);
    if (amount === null) {
      continue;
    }
    rows.push({
      key: nutrient.key,
      label: nutrient.label,
      display: `${formatQuantity(amount)} ${nutrient.unit}`,
    });
  }

  if (rows.length === 0) {
    return { basis: null, rows: [] };
  }

  return { basis: basisLabel(nutritionDataPer, suffix === 'serving'), rows };
}

const COMPARE_NUTRIENTS: { key: string; label: string; unit: string }[] = [
  { key: 'energy-kcal', label: 'Energy', unit: 'kcal' },
  { key: 'energy-kj', label: 'Energy', unit: 'kJ' },
  { key: 'sugars', label: 'Sugars', unit: 'g' },
  { key: 'fat', label: 'Total fat', unit: 'g' },
  { key: 'saturated-fat', label: 'Saturated fat', unit: 'g' },
  { key: 'carbohydrates', label: 'Carbohydrates', unit: 'g' },
  { key: 'proteins', label: 'Protein', unit: 'g' },
  { key: 'fiber', label: 'Fibre', unit: 'g' },
  { key: 'salt', label: 'Salt', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'g' },
];

function nutrientBasis(nutritionDataPer: unknown, suffix: '100g' | 'serving'): NutrientBasis {
  if (suffix === 'serving') {
    return 'serving';
  }
  return nutritionDataPer === '100ml' ? '100ml' : '100g';
}

function readComparableAmount(nutriments: Record<string, unknown>, key: string, suffix: '100g' | 'serving'): number | null {
  if (key === 'fiber') {
    return readNumber(nutriments[`fiber_${suffix}`]) ?? readNumber(nutriments[`fibre_${suffix}`]);
  }
  return readNumber(nutriments[`${key}_${suffix}`]);
}

export function extractComparableNutrition(nutrimentsValue: unknown, nutritionDataPer: unknown): ComparableNutrient[] {
  if (!isRecord(nutrimentsValue)) {
    return [];
  }
  const hasPer100 = COMPARE_NUTRIENTS.some((nutrient) => readComparableAmount(nutrimentsValue, nutrient.key, '100g') !== null);
  const suffix: '100g' | 'serving' = hasPer100 ? '100g' : 'serving';
  const basis = nutrientBasis(nutritionDataPer, suffix);
  const rows: ComparableNutrient[] = [];
  for (const nutrient of COMPARE_NUTRIENTS) {
    const amount = readComparableAmount(nutrimentsValue, nutrient.key, suffix);
    if (amount === null) {
      continue;
    }
    rows.push({ key: nutrient.key, label: nutrient.label, amount, unit: nutrient.unit, basis });
  }
  return rows;
}
