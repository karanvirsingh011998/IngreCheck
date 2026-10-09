import { premiumMode, visibleHistoryCap } from '../features/entitlements';
import type { Product } from '../types/product';
import { cloudFailure, mapCloudError, type CloudResult } from '../utils/cloudErrors';
import { HISTORY_DEDUPE_MS, HISTORY_PAGE_SIZE, shouldRecordScan } from '../utils/historyRules';
import { supabase } from './supabase';

export type SavedProduct = {
  id: string;
  barcode: string;
  productName: string | null;
  brand: string | null;
  imageUrl: string | null;
  savedAt: string;
};

export const SIGN_IN_TO_SAVE =
  'An account is optional. Sign in to save history, favorites, and ingredient preferences. Scanning still works without one.';

const NOT_CONFIGURED = 'Profile sign-in is not configured yet. Scanning still works.';

function textOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function savedProduct(row: unknown, timeKey: 'scanned_at' | 'created_at'): SavedProduct | null {
  if (typeof row !== 'object' || row === null) {
    return null;
  }
  const record = row as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.barcode !== 'string') {
    return null;
  }
  const savedAt = record[timeKey];
  if (typeof savedAt !== 'string') {
    return null;
  }
  return {
    id: record.id,
    barcode: record.barcode,
    productName: textOrNull(record.product_name),
    brand: textOrNull(record.brand),
    imageUrl: textOrNull(record.image_url),
    savedAt,
  };
}

export async function currentUserId(): Promise<CloudResult<string>> {
  if (!supabase) {
    return cloudFailure('unconfigured', NOT_CONFIGURED);
  }
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return mapCloudError(error);
  }
  if (!data.user) {
    return cloudFailure('signed_out', SIGN_IN_TO_SAVE);
  }
  return { ok: true, data: data.user.id };
}

function snapshot(product: Product) {
  return {
    barcode: product.code,
    product_name: product.name,
    brand: product.brands,
    image_url: product.imageUrl,
  };
}

export async function recordScan(product: Product): Promise<CloudResult<{ saved: boolean }>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }

  const since = new Date(Date.now() - HISTORY_DEDUPE_MS).toISOString();
  const recent = await supabase
    .from('scan_history')
    .select('scanned_at')
    .eq('user_id', user.data)
    .eq('barcode', product.code)
    .gte('scanned_at', since)
    .limit(1);

  if (recent.error) {
    return mapCloudError(recent.error);
  }

  const rows = Array.isArray(recent.data) ? recent.data : [];
  const first = rows[0] as { scanned_at?: unknown } | undefined;
  const last = typeof first?.scanned_at === 'string' ? first.scanned_at : null;
  if (!shouldRecordScan(last, Date.now())) {
    return { ok: true, data: { saved: false } };
  }

  const inserted = await supabase.from('scan_history').insert({
    user_id: user.data,
    ...snapshot(product),
  });
  if (inserted.error) {
    return mapCloudError(inserted.error);
  }
  return { ok: true, data: { saved: true } };
}

export async function listScanHistory(page: number): Promise<CloudResult<{ items: SavedProduct[]; hasMore: boolean }>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }

  const cap = visibleHistoryCap(premiumMode);
  const start = page * HISTORY_PAGE_SIZE;
  if (cap !== null && start >= cap) {
    return { ok: true, data: { items: [], hasMore: false } };
  }

  const end = cap === null ? start + HISTORY_PAGE_SIZE - 1 : Math.min(start + HISTORY_PAGE_SIZE, cap) - 1;
  const result = await supabase
    .from('scan_history')
    .select('id, barcode, product_name, brand, image_url, scanned_at')
    .eq('user_id', user.data)
    .order('scanned_at', { ascending: false })
    .range(start, end);

  if (result.error) {
    return mapCloudError(result.error);
  }

  const items = (Array.isArray(result.data) ? result.data : [])
    .map((row) => savedProduct(row, 'scanned_at'))
    .filter((item): item is SavedProduct => item !== null);
  const reachedCap = cap !== null && start + items.length >= cap;
  return { ok: true, data: { items, hasMore: !reachedCap && items.length === end - start + 1 } };
}

export async function deleteScan(id: string): Promise<CloudResult<true>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const result = await supabase.from('scan_history').delete().eq('id', id).eq('user_id', user.data);
  return result.error ? mapCloudError(result.error) : { ok: true, data: true };
}

export async function clearScanHistory(): Promise<CloudResult<true>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const result = await supabase.from('scan_history').delete().eq('user_id', user.data);
  return result.error ? mapCloudError(result.error) : { ok: true, data: true };
}

export async function favoriteStatus(barcode: string): Promise<CloudResult<boolean>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const result = await supabase
    .from('favorite_products')
    .select('id')
    .eq('user_id', user.data)
    .eq('barcode', barcode)
    .limit(1);
  if (result.error) {
    return mapCloudError(result.error);
  }
  return { ok: true, data: Array.isArray(result.data) && result.data.length > 0 };
}

export async function setFavorite(product: Product, favorite: boolean): Promise<CloudResult<boolean>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }

  if (!favorite) {
    const removed = await supabase
      .from('favorite_products')
      .delete()
      .eq('user_id', user.data)
      .eq('barcode', product.code);
    return removed.error ? mapCloudError(removed.error) : { ok: true, data: false };
  }

  const added = await supabase.from('favorite_products').insert({
    user_id: user.data,
    ...snapshot(product),
  });
  if (added.error) {
    return mapCloudError(added.error);
  }
  return { ok: true, data: true };
}

export async function listFavorites(): Promise<CloudResult<SavedProduct[]>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const result = await supabase
    .from('favorite_products')
    .select('id, barcode, product_name, brand, image_url, created_at')
    .eq('user_id', user.data)
    .order('created_at', { ascending: false });
  if (result.error) {
    return mapCloudError(result.error);
  }
  const items = (Array.isArray(result.data) ? result.data : [])
    .map((row) => savedProduct(row, 'created_at'))
    .filter((item): item is SavedProduct => item !== null);
  return { ok: true, data: items };
}

export async function removeFavorite(id: string): Promise<CloudResult<true>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const result = await supabase.from('favorite_products').delete().eq('id', id).eq('user_id', user.data);
  return result.error ? mapCloudError(result.error) : { ok: true, data: true };
}

export type IngredientPreference = {
  id: string;
  ingredientName: string;
  preferenceType: 'avoid' | 'monitor';
};

function preferenceRow(row: unknown): IngredientPreference | null {
  if (typeof row !== 'object' || row === null) {
    return null;
  }
  const record = row as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.ingredient_name !== 'string') {
    return null;
  }
  if (record.preference_type !== 'avoid' && record.preference_type !== 'monitor') {
    return null;
  }
  return {
    id: record.id,
    ingredientName: record.ingredient_name,
    preferenceType: record.preference_type,
  };
}

export async function listPreferences(): Promise<CloudResult<IngredientPreference[]>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const result = await supabase
    .from('ingredient_preferences')
    .select('id, ingredient_name, preference_type')
    .eq('user_id', user.data)
    .order('ingredient_name', { ascending: true });
  if (result.error) {
    return mapCloudError(result.error);
  }
  const items = (Array.isArray(result.data) ? result.data : [])
    .map(preferenceRow)
    .filter((item): item is IngredientPreference => item !== null);
  return { ok: true, data: items };
}

export async function addPreference(
  ingredientName: string,
  preferenceType: 'avoid' | 'monitor',
): Promise<CloudResult<true>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const result = await supabase.from('ingredient_preferences').insert({
    user_id: user.data,
    ingredient_name: ingredientName,
    preference_type: preferenceType,
  });
  return result.error ? mapCloudError(result.error) : { ok: true, data: true };
}

export async function updatePreference(
  id: string,
  ingredientName: string,
  preferenceType: 'avoid' | 'monitor',
): Promise<CloudResult<true>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const result = await supabase
    .from('ingredient_preferences')
    .update({ ingredient_name: ingredientName, preference_type: preferenceType })
    .eq('id', id)
    .eq('user_id', user.data);
  return result.error ? mapCloudError(result.error) : { ok: true, data: true };
}

export async function removePreference(id: string): Promise<CloudResult<true>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const result = await supabase.from('ingredient_preferences').delete().eq('id', id).eq('user_id', user.data);
  return result.error ? mapCloudError(result.error) : { ok: true, data: true };
}

export const DELETE_ACCOUNT_FALLBACK =
  'The app could not delete this account. In the Supabase dashboard, open Authentication, find this user, and delete the account. History, favorites, and preferences are removed with the user.';

export async function loadDisplayName(): Promise<CloudResult<string | null>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const result = await supabase.from('profiles').select('display_name').eq('id', user.data).limit(1);
  if (result.error) {
    return mapCloudError(result.error);
  }
  const rows = Array.isArray(result.data) ? result.data : [];
  const row = rows[0] as { display_name?: unknown } | undefined;
  return { ok: true, data: textOrNull(row?.display_name) };
}

export async function saveDisplayName(displayName: string): Promise<CloudResult<string>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const trimmed = displayName.trim();
  const result = await supabase.from('profiles').upsert({ id: user.data, display_name: trimmed || null });
  if (result.error) {
    return mapCloudError(result.error);
  }
  const metadata = await supabase.auth.updateUser({ data: { full_name: trimmed } });
  if (metadata.error) {
    return mapCloudError(metadata.error);
  }
  return { ok: true, data: trimmed };
}

export type AccountCounts = {
  scans: number;
  favorites: number;
  preferences: number;
};

async function countRows(
  table: 'scan_history' | 'favorite_products' | 'ingredient_preferences',
  userId: string,
): Promise<CloudResult<number>> {
  if (!supabase) {
    return cloudFailure('unconfigured', NOT_CONFIGURED);
  }
  const result = await supabase.from(table).select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if (result.error) {
    return mapCloudError(result.error);
  }
  return { ok: true, data: typeof result.count === 'number' ? result.count : 0 };
}

export async function loadAccountCounts(): Promise<CloudResult<AccountCounts>> {
  const user = await currentUserId();
  if (!user.ok || !supabase) {
    return user.ok ? cloudFailure('unconfigured', NOT_CONFIGURED) : user;
  }
  const [scans, favorites, preferences] = await Promise.all([
    countRows('scan_history', user.data),
    countRows('favorite_products', user.data),
    countRows('ingredient_preferences', user.data),
  ]);
  if (!scans.ok) {
    return scans;
  }
  if (!favorites.ok) {
    return favorites;
  }
  if (!preferences.ok) {
    return preferences;
  }
  return {
    ok: true,
    data: { scans: scans.data, favorites: favorites.data, preferences: preferences.data },
  };
}

export async function deleteOwnAccount(): Promise<CloudResult<true>> {
  if (!supabase) {
    return cloudFailure('unconfigured', NOT_CONFIGURED);
  }
  const result = await supabase.rpc('delete_own_account');
  if (result.error) {
    return cloudFailure('rejected', DELETE_ACCOUNT_FALLBACK);
  }
  return { ok: true, data: true };
}
