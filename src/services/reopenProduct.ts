import { lookupProduct } from './openFoodFacts';
import { cacheProduct, readCachedProduct } from './productCache';
import type { Product } from '../types/product';

export async function reopenProduct(
  barcode: string,
): Promise<{ ok: true; product: Product; fromCache: boolean } | { ok: false; message: string }> {
  const fresh = await lookupProduct(barcode);
  if (fresh.ok) {
    await cacheProduct(fresh.product).catch(() => undefined);
    return { ok: true, product: fresh.product, fromCache: false };
  }
  if (fresh.code === 'network' || fresh.code === 'timeout') {
    const cached = await readCachedProduct(barcode).catch(() => null);
    if (cached) {
      return { ok: true, product: cached, fromCache: true };
    }
  }
  return { ok: false, message: fresh.message };
}
