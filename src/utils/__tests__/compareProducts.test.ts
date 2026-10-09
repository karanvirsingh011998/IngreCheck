import { matchIngredient } from '../matchIngredient';
import {
  COMPARISON_INSUFFICIENT,
  COMPARISON_SAFETY_NOTICE,
  compareProducts,
} from '../compareProducts';
import { extractComparableNutrition } from '../nutrition';
import type { ExplainedIngredient } from '../../types/ingredient';
import type { ComparableNutrient, Product } from '../../types/product';

function explained(text: string, id?: string): ExplainedIngredient {
  return {
    text,
    sourceId: id ?? null,
    match: matchIngredient({ id: id ?? null, name: text }),
  };
}

function product(overrides: Partial<Product> & Pick<Product, 'code'>): Product {
  return {
    name: 'Sample',
    brands: null,
    imageUrl: null,
    categories: null,
    countries: null,
    ingredientsText: null,
    ingredientsTextEn: null,
    ingredients: [],
    quantity: null,
    recordedLabels: [],
    nutritionGrade: null,
    nutritionBasis: null,
    nutrition: [],
    comparableNutrition: [],
    allergens: [],
    traces: [],
    allergenStatus: 'missing',
    novaGroup: null,
    sourceUrl: 'https://world.openfoodfacts.org',
    lastUpdated: null,
    ...overrides,
  };
}

function nutrient(partial: Partial<ComparableNutrient> & Pick<ComparableNutrient, 'key' | 'amount'>): ComparableNutrient {
  return {
    label: 'Sugars',
    unit: 'g',
    basis: '100g',
    ...partial,
  };
}

describe('product comparison', () => {
  it('compares two valid products without an account or a winner', () => {
    const result = compareProducts(
      product({
        code: '111',
        name: 'Alpha',
        ingredientsText: 'Sugar, palm oil',
        ingredients: [explained('Sugar', 'en:sugar'), explained('palm oil', 'en:palm-oil')],
        comparableNutrition: [nutrient({ key: 'sugars', label: 'Sugars', amount: 20 })],
        allergens: ['Milk'],
        allergenStatus: 'listed',
        novaGroup: 4,
      }),
      product({
        code: '222',
        name: 'Beta',
        ingredientsText: 'sucrose, water',
        ingredients: [explained('sucrose', 'en:sucrose'), explained('water')],
        comparableNutrition: [nutrient({ key: 'sugars', label: 'Sugars', amount: 5 })],
        allergens: ['Milk'],
        allergenStatus: 'listed',
        novaGroup: 4,
      }),
    );

    expect(result.summary.some((line) => /healthier|winner|unsafe/i.test(line))).toBe(false);
    expect(result.summary).toContain('Product A has more sugar per 100 g.');
    expect(result.ingredients.shared).toContain('Sucrose');
    expect(result.novaA).toContain('NOVA 4');
    expect(result.novaB).toContain('NOVA 4');
    expect(result.coverageA.level).toBe('good');
  });

  it('does not treat a missing ingredient list as an empty recipe', () => {
    const result = compareProducts(
      product({ code: '111', ingredientsText: 'Salt', ingredients: [explained('Salt')] }),
      product({ code: '222' }),
    );
    expect(result.ingredients.comparable).toBe(false);
    expect(result.ingredients.onlyA).toEqual([]);
    expect(result.ingredients.originalB).toBeNull();
    expect(result.summary.join(' ')).not.toMatch(/absent/i);
  });

  it('keeps a stored zero and leaves a missing nutrient unavailable', () => {
    const result = compareProducts(
      product({
        code: '111',
        comparableNutrition: [nutrient({ key: 'salt', label: 'Salt', amount: 0 })],
      }),
      product({
        code: '222',
        comparableNutrition: [nutrient({ key: 'sugars', label: 'Sugars', amount: 4 })],
      }),
    );
    const salt = result.nutrition.find((row) => row.label === 'Salt');
    const sugars = result.nutrition.find((row) => row.label === 'Sugars');
    expect(salt?.valueA).toBe('0 g per 100 g');
    expect(salt?.valueB).toBe('Not available');
    expect(salt?.statement).toBeNull();
    expect(sugars?.valueA).toBe('Not available');
    expect(sugars?.statement).toBeNull();
  });

  it('does not compare different units or serving sizes', () => {
    const result = compareProducts(
      product({
        code: '111',
        comparableNutrition: [nutrient({ key: 'sugars', label: 'Sugars', amount: 10, basis: '100g' })],
      }),
      product({
        code: '222',
        comparableNutrition: [nutrient({ key: 'sugars', label: 'Sugars', amount: 4, basis: 'serving' })],
      }),
    );
    const sugars = result.nutrition.find((row) => row.label === 'Sugars');
    expect(sugars?.statement).toMatch(/cannot be compared/);
    expect(sugars?.statement).not.toMatch(/has more/);
  });

  it('does not convert salt into sodium or kilocalories into kilojoules', () => {
    const result = compareProducts(
      product({
        code: '111',
        comparableNutrition: [
          nutrient({ key: 'salt', label: 'Salt', amount: 1 }),
          nutrient({ key: 'energy-kcal', label: 'Energy', unit: 'kcal', amount: 100 }),
        ],
      }),
      product({
        code: '222',
        comparableNutrition: [
          nutrient({ key: 'sodium', label: 'Sodium', amount: 0.4 }),
          nutrient({ key: 'energy-kj', label: 'Energy', unit: 'kJ', amount: 400 }),
        ],
      }),
    );
    expect(result.summary.join(' ')).not.toMatch(/has more salt|has more sodium|has more energy/i);
  });

  it('matches equivalent ingredient names and leaves similar names apart', () => {
    const result = compareProducts(
      product({
        code: '111',
        ingredientsText: 'soy lecithin, glucose',
        ingredients: [explained('soy lecithin', 'en:soya-lecithin'), explained('glucose', 'en:glucose')],
      }),
      product({
        code: '222',
        ingredientsText: 'sunflower lecithin, glucose-fructose syrup',
        ingredients: [explained('sunflower lecithin', 'en:sunflower-lecithin'), explained('glucose-fructose syrup')],
      }),
    );
    expect(result.ingredients.shared).toContain('Lecithins');
    expect(result.ingredients.shared.join(' ')).not.toMatch(/glucose-fructose/i);
    expect(result.ingredients.onlyA.join(' ')).toMatch(/glucose/i);
  });

  it('reports missing allergens and missing NOVA without guessing', () => {
    const result = compareProducts(
      product({ code: '111', name: 'Named', allergenStatus: 'missing', novaGroup: null }),
      product({ code: '222', name: 'Other', allergens: ['Milk'], allergenStatus: 'listed', novaGroup: 1 }),
    );
    expect(result.allergensMissingA).toBe(true);
    expect(result.novaA).toBeNull();
    expect(result.novaB).toContain('NOVA 1');
    expect(result.summary).toContain('Allergen information is unavailable for Product A.');
    expect(result.summary).toContain('NOVA classification is available for only one product.');
    expect(result.summary.join(' ')).not.toMatch(/allergen-free|guarante/i);
    expect(COMPARISON_SAFETY_NOTICE).toMatch(/physical packaging/i);
  });

  it('calculates good, partial, and limited coverage from present fields', () => {
    const limited = compareProducts(product({ code: '111', name: 'Named' }), product({ code: '222', name: 'Unnamed product' }));
    expect(limited.coverageA.level).toBe('limited');
    expect(limited.coverageB.present).not.toContain('Product name');

    const partial = compareProducts(
      product({
        code: '333',
        name: 'Named',
        ingredientsText: 'Salt',
        ingredients: [explained('Salt')],
        comparableNutrition: [nutrient({ key: 'salt', label: 'Salt', amount: 1 })],
      }),
      product({ code: '444', name: 'Other' }),
    );
    expect(partial.coverageA.level).toBe('partial');
  });

  it('says when the records are not enough to compare', () => {
    const result = compareProducts(
      product({ code: '111', name: 'Named', allergens: ['Milk'], allergenStatus: 'listed', novaGroup: 3 }),
      product({ code: '222', name: 'Other', allergens: ['Nuts'], allergenStatus: 'listed', novaGroup: 3 }),
    );
    expect(result.summary).toEqual([COMPARISON_INSUFFICIENT]);
  });

  it('reads comparable nutrition without turning a missing field into zero', () => {
    expect(extractComparableNutrition({ salt_100g: 0, sugars_100g: 2 }, '100ml')).toEqual([
      { key: 'sugars', label: 'Sugars', amount: 2, unit: 'g', basis: '100ml' },
      { key: 'salt', label: 'Salt', amount: 0, unit: 'g', basis: '100ml' },
    ]);
    expect(extractComparableNutrition({}, '100g')).toEqual([]);
  });
});
