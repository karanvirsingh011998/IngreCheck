import type { Product } from '../../types/product';
import { CACHED_PRODUCT_LABEL, PRODUCT_CACHE_LIMIT, rememberProduct } from '../productCache';

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

describe('saved product copy', () => {
  it('labels a cached product as a saved copy', () => {
    expect(CACHED_PRODUCT_LABEL).toContain('saved copy');
    expect(CACHED_PRODUCT_LABEL).toContain('not a fresh result');
  });

  it('keeps the newest saved copies and drops the oldest past the limit', () => {
    let stored: Record<string, { product: Product; savedAt: string }> = {};
    for (let index = 0; index < PRODUCT_CACHE_LIMIT + 2; index += 1) {
      const savedAt = new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString();
      stored = rememberProduct(stored, product(String(index)), savedAt);
    }
    expect(Object.keys(stored)).toHaveLength(PRODUCT_CACHE_LIMIT);
    expect(stored['0']).toBeUndefined();
    expect(stored[String(PRODUCT_CACHE_LIMIT + 1)]?.product.code).toBe(String(PRODUCT_CACHE_LIMIT + 1));
  });
});
