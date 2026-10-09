import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1800;

function storageKey(key: string): string {
  const safe = key.replace(/[^A-Za-z0-9._-]/g, '_');
  return safe.length > 0 ? safe : 'supabase_auth';
}

async function deleteQuietly(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // A missing key is already removed.
  }
}

async function clearKey(key: string): Promise<void> {
  const safe = storageKey(key);
  const countRaw = await SecureStore.getItemAsync(`${safe}.count`);
  const count = countRaw ? Number(countRaw) : 0;
  if (Number.isInteger(count) && count > 0) {
    for (let index = 0; index < count; index += 1) {
      await deleteQuietly(`${safe}.${index}`);
    }
    await deleteQuietly(`${safe}.count`);
  }
  await deleteQuietly(safe);
}

/**
 * SecureStore rejects values above about 2048 bytes. Auth sessions are split
 * into chunks so a returning profile still restores after the app closes.
 */
export const secureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const safe = storageKey(key);
    const countRaw = await SecureStore.getItemAsync(`${safe}.count`);
    const count = countRaw ? Number(countRaw) : 0;
    if (!Number.isInteger(count) || count < 2) {
      return SecureStore.getItemAsync(safe);
    }
    const parts: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const part = await SecureStore.getItemAsync(`${safe}.${index}`);
      if (part === null) {
        return null;
      }
      parts.push(part);
    }
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    const safe = storageKey(key);
    await clearKey(key);
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(safe, value);
      return;
    }
    const count = Math.ceil(value.length / CHUNK_SIZE);
    for (let index = 0; index < count; index += 1) {
      await SecureStore.setItemAsync(safe + '.' + String(index), value.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${safe}.count`, String(count));
  },

  async removeItem(key: string): Promise<void> {
    await clearKey(key);
  },
};
