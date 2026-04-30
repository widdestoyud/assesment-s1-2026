import type { AwilixRegistry } from '@di/container';

import { MBC_KEYS } from '@utils/constants/mbc-keys';

export interface DeviceIdResult {
  deviceId: string;
  wasRegenerated: boolean;
}

export interface DeviceServiceInterface {
  /** Get the current Device_ID from storage. Returns undefined if not found. */
  getDeviceId(): Promise<string | undefined>;
  /**
   * Ensure a Device_ID exists. If missing, generate a new one and persist it.
   * Returns the deviceId and whether it was newly generated (wasRegenerated).
   */
  ensureDeviceId(): Promise<DeviceIdResult>;
}

export const DeviceService = (
  deps: Pick<AwilixRegistry, 'keyValueStore'>,
): DeviceServiceInterface => {
  const { keyValueStore } = deps;

  const storeName = MBC_KEYS.MBC_STORE_NAME;
  const key = MBC_KEYS.MBC_DEVICE_ID;

  const getDeviceId = async (): Promise<string | undefined> => {
    return keyValueStore.get<string>(storeName, key);
  };

  const ensureDeviceId = async (): Promise<DeviceIdResult> => {
    const existing = await getDeviceId();

    if (existing) {
      return { deviceId: existing, wasRegenerated: false };
    }

    // Generate a new UUID using the Web Crypto API
    const newId = crypto.randomUUID();
    await keyValueStore.set(storeName, key, newId);

    return { deviceId: newId, wasRegenerated: true };
  };

  return { getDeviceId, ensureDeviceId };
};
