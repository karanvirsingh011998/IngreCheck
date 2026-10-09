import type { Product } from '../../types/product';
import { clearCompareSlots, readCompareSlots, saveCompareSlot } from '../compareSlots';

function product(code: string): Product {
  return {
    code,
    name: `Product ${code}`,
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
  };
}

describe('compare slots', () => {
  beforeEach(() => {
    clearCompareSlots();
  });

  it('keeps the first product when the second slot is filled', () => {
    saveCompareSlot('a', product('111'));
    const next = saveCompareSlot('b', product('222'));
    expect(next.a?.code).toBe('111');
    expect(next.b?.code).toBe('222');
    expect(readCompareSlots()).toEqual(next);
  });
});