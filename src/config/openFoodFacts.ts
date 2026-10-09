export const OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v3/product';
export const OPEN_FOOD_FACTS_WEB = 'https://world.openfoodfacts.org/product';
export const USER_AGENT = 'IngreCheck/1.0 (https://world.openfoodfacts.org)';
export const LOOKUP_TIMEOUT_MS = 12000;

export const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'brands',
  'quantity',
  'image_front_url',
  'ingredients_text',
  'ingredients_text_en',
  'ingredients',
  'nutriments',
  'nutrition_data_per',
  'allergens_tags',
  'allergens',
  'traces_tags',
  'traces',
  'categories',
  'categories_tags',
  'labels_tags',
  'nutrition_grades_tags',
  'nova_group',
  'countries',
  'countries_tags',
  'last_modified_t',
].join(',');

export function productPageUrl(code: string): string {
  return `${OPEN_FOOD_FACTS_WEB}/${encodeURIComponent(code)}`;
}

export function productApiUrl(code: string): string {
  const params = new URLSearchParams({ fields: PRODUCT_FIELDS });
  return `${OPEN_FOOD_FACTS_API}/${encodeURIComponent(code)}?${params.toString()}`;
}
