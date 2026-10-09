import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Product } from '../types/product';
import { rememberProduct, type CachedProductRecord } from '../utils/productCache';

const STORAGE_KEY = 'ingrecheck.productCache.v1';

function isRecord(value: unknown): value is Record<string, CachedProductRecord> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readAll(): Promise<Record<string, CachedProductRecord>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export async function cacheProduct(product: Product): Promise<void> {
  const next = rememberProduct(await readAll(), product, new Date().toISOString());
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export async function readCachedProduct(barcode: string): Promise<Product | null> {
  const stored = (await readAll())[barcode];
  if (!stored || typeof stored.product !== 'object' || stored.product === null) {
    return null;
  }
  return stored.product.code === barcode ? stored.product : null;
}
