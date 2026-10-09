import { allergenNote, summarizeAllergens } from '../allergens';
import { buildNutrition } from '../nutrition';

describe('allergens and nutrition fallbacks', () => {
  it('separates listed allergens from traces and missing data', () => {
    expect(summarizeAllergens(['en:milk', 'en:nuts'], ['en:soybeans'])).toEqual({
      allergens: ['Milk', 'Nuts'],
      traces: ['Soybeans'],
      status: 'listed',
    });
    expect(summarizeAllergens([], ['en:gluten'])).toMatchObject({ status: 'traces_only', allergens: [] });
    expect(summarizeAllergens(undefined, [])).toMatchObject({ status: 'missing', allergens: [], traces: [] });
    expect(allergenNote()).toContain('does not mean a product is allergen-free');
  });

  it('omits missing nutrients, keeps a real zero, and does not swap salt with sodium', () => {
    const partial = buildNutrition(
      {
        'energy-kcal_100g': 539,
        'energy-kj_100g': 2252,
        fat_100g: 30.9,
        fiber_100g: 0,
        sodium_100g: 0.043,
      },
      '100g',
    );
    expect(partial.basis).toBe('Per 100 g');
    expect(partial.rows.map((row) => row.label)).toEqual(['Energy', 'Total fat', 'Fibre', 'Sodium']);
    expect(partial.rows.find((row) => row.key === 'fiber')?.display).toBe('0 g');
    expect(partial.rows.find((row) => row.key === 'salt')).toBeUndefined();
    expect(partial.rows.find((row) => row.key === 'sodium')?.display).toContain('g');
  });

  it('labels millilitres and does not invent zeroes for an empty panel', () => {
    expect(buildNutrition({}, '100ml')).toEqual({ basis: null, rows: [] });
    const serving = buildNutrition({ sugars_serving: 4 }, 'serving');
    expect(serving.basis).toBe('Per serving');
    expect(serving.rows).toEqual([{ key: 'sugars', label: 'Sugars', display: '4 g' }]);
  });
});
