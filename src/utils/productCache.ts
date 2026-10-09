import type { Product } from '../types/product';

export const CACHED_PRODUCT_LABEL =
  'This is a saved copy from your last lookup, not a fresh result from Open Food Facts.';

export const PRODUCT_CACHE_LIMIT = 30;

export type CachedProductRecord = {
  product: Product;
  savedAt: string;
};

export function rememberProduct(
  existing: Record<string, CachedProductRecord>,
  product: Product,
  savedAt: string,
): Record<string, CachedProductRecord> {
  const next = { ...existing, [product.code]: { product, savedAt } };
  const entries = Object.entries(next).sort((left, right) => right[1].savedAt.localeCompare(left[1].savedAt));
  return Object.fromEntries(entries.slice(0, PRODUCT_CACHE_LIMIT));
}
