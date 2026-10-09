import { parseProductResponse } from '../normalizeProduct';

const complete = {
  status: 'success',
  result: { id: 'product_found' },
  product: {
    code: '3017620422003',
    product_name: 'Nutella',
    brands: 'Ferrero',
    image_front_url: 'https://images.openfoodfacts.org/example.jpg',
    ingredients_text: 'Sugar, palm oil, hazelnuts, soy lecithin.',
    ingredients: [
      { id: 'en:sugar', text: 'Sugar' },
      { id: 'en:palm-oil', text: 'huile de palme' },
      { id: 'en:hazelnut', text: 'Hazelnuts' },
      { id: 'en:soya-lecithin', text: 'soy lecithin' },
    ],
    nutriments: {
      'energy-kcal_100g': 539,
      fat_100g: 30.9,
      'saturated-fat_100g': 10.6,
      carbohydrates_100g: 57.5,
      sugars_100g: 56.3,
      proteins_100g: 6.3,
      salt_100g: 0.107,
    },
    nutrition_data_per: '100g',
    allergens_tags: ['en:milk', 'en:nuts'],
    traces_tags: ['en:gluten'],
    categories: 'Spreads',
    nova_group: 4,
    countries: 'France',
  },
};

describe('product normalization', () => {
  it('maps a complete Open Food Facts record', () => {
    const result = parseProductResponse(complete);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.product.name).toBe('Nutella');
    expect(result.product.brands).toBe('Ferrero');
    expect(result.product.imageUrl).toContain('https://');
    expect(result.product.novaGroup).toBe(4);
    expect(result.product.allergens).toEqual(['Milk', 'Nuts']);
    expect(result.product.traces).toEqual(['Gluten']);
    expect(result.product.ingredientsText).toContain('Sugar');
    expect(result.product.ingredients.find((item) => item.text === 'Hazelnuts')?.match.status).toBe('unknown');
    expect(result.product.ingredients.find((item) => item.text === 'Sugar')?.match.status).toBe('matched');
    expect(result.product.nutritionBasis).toBe('Per 100 g');
    expect(result.product.sourceUrl).toBe('https://world.openfoodfacts.org/product/3017620422003');
  });

  it('survives missing image, ingredients, nutrition, allergens, and NOVA data', () => {
    const result = parseProductResponse({
      status: 'success',
      product: {
        code: '123',
        product_name: '',
        image_front_url: 'not-a-url',
        nova_group: null,
      },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.product.name).toBe('Unnamed product');
    expect(result.product.imageUrl).toBeNull();
    expect(result.product.ingredientsText).toBeNull();
    expect(result.product.ingredients).toEqual([]);
    expect(result.product.nutrition).toEqual([]);
    expect(result.product.allergenStatus).toBe('missing');
    expect(result.product.novaGroup).toBeNull();
  });

  it('distinguishes a missing product from a malformed payload', () => {
    expect(parseProductResponse({ status: 'failure', result: { id: 'product_not_found' } })).toMatchObject({
      ok: false,
      code: 'not_found',
    });
    expect(parseProductResponse({ status: 'success' })).toMatchObject({ ok: false, code: 'malformed' });
    expect(parseProductResponse('nope')).toMatchObject({ ok: false, code: 'malformed' });
  });
});
