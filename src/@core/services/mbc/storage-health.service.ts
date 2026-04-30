import type { AwilixRegistry } from '@di/container';
import type { StorageError } from '@core/services/mbc/models';

export interface StorageHealthResult {
  canWrite: boolean;
  error?: StorageError;
}

export interface StorageHealthServiceInterface {
  /** Check if the underlying storage is accessible and writable */
  isAvailable(): Promise<boolean>;
  /** Attempt a test write to detect quota exceeded or other write failures */
  checkWriteCapacity(): Promise<StorageHealthResult>;
}

export const StorageHealthService = (
  deps: Pick<AwilixRegistry, 'keyValueStore'>,
): StorageHealthServiceInterface => {
  const { keyValueStore } = deps;

  const isAvailable = async (): Promise<boolean> => {
    return keyValueStore.isAvailable();
  };

  const checkWriteCapacity = async (): Promise<StorageHealthResult> => {
    try {
      const available = await keyValueStore.isAvailable();
      if (!available) {
        return {
          canWrite: false,
          error: {
            type: 'unavailable',
            message:
              'localStorage is not available. The browser may be in private mode or storage is restricted.',
          },
        };
      }

      // Attempt a test write/read/delete cycle
      const testKey = '__storage_health_check__';
      const testValue = 'health-check';
      await keyValueStore.set('__test__', testKey, testValue);
      const readBack = await keyValueStore.get<string>('__test__', testKey);
      await keyValueStore.delete('__test__', testKey);

      if (readBack !== testValue) {
        return {
          canWrite: false,
          error: {
            type: 'write_failed',
            message:
              'Storage write verification failed — written data does not match read data.',
          },
        };
      }

      return { canWrite: true };
    } catch (error: unknown) {
      if (isQuotaExceededError(error)) {
        return {
          canWrite: false,
          error: {
            type: 'quota_exceeded',
            message:
              'Storage quota exceeded. Please clear browser data to free up space.',
          },
        };
      }

      return {
        canWrite: false,
        error: {
          type: 'write_failed',
          message:
            error instanceof Error
              ? `Storage write failed: ${error.message}`
              : 'Storage write failed due to an unknown error.',
        },
      };
    }
  };

  return { isAvailable, checkWriteCapacity };
};

/** Detect QuotaExceededError across browsers */
function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException) {
    // Chrome, Firefox, Edge
    if (error.name === 'QuotaExceededError') return true;
    // Safari (older versions)
    if (error.code === 22) return true;
  }
  return false;
}
