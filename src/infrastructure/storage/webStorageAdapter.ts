import type { KeyValueStoreProtocol } from '@core/protocols/key-value-store';

/**
 * KeyValueStoreProtocol implementation backed by window.localStorage.
 * Used as the FALLBACK store in the dual-layer resilience strategy.
 *
 * Internally uses JSON.stringify/parse to support typed values.
 * The `storeName` parameter is prefixed to the key for namespace isolation.
 */
export const webStorageAdapter: KeyValueStoreProtocol = {
  get: async <T>(storeName: string, key: string): Promise<T | undefined> => {
    const raw = localStorage.getItem(`${storeName}:${key}`);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  },

  set: async <T>(storeName: string, key: string, value: T): Promise<void> => {
    localStorage.setItem(`${storeName}:${key}`, JSON.stringify(value));
  },

  delete: async (storeName: string, key: string): Promise<void> => {
    localStorage.removeItem(`${storeName}:${key}`);
  },

  getAll: async <T>(storeName: string): Promise<T[]> => {
    const prefix = `${storeName}:`;
    const results: T[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (fullKey && fullKey.startsWith(prefix)) {
        const raw = localStorage.getItem(fullKey);
        if (raw) {
          try {
            results.push(JSON.parse(raw) as T);
          } catch {
            // Skip malformed entries
          }
        }
      }
    }
    return results;
  },

  isAvailable: async (): Promise<boolean> => {
    try {
      const testKey = '__kv_store_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};
