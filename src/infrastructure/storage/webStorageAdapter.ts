/**
 * Simple localStorage wrapper used for TanStack Query persistence
 * and any future key-value storage needs.
 */
export const webStorageAdapter = {
  get: async <T>(storeName: string, key: string): Promise<T | undefined> => {
    const raw = localStorage.getItem(`${storeName}:${key}`);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  },

  set: async (storeName: string, key: string, value: unknown): Promise<void> => {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(`${storeName}:${key}`, serialized);
  },

  delete: async (storeName: string, key: string): Promise<void> => {
    localStorage.removeItem(`${storeName}:${key}`);
  },
};
