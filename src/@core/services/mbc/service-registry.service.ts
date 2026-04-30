import type { AwilixRegistry } from '@di/container';
import type { ServiceType } from '@core/services/mbc/models';

import {
  DEFAULT_PARKING_SERVICE,
  ServiceTypeFormSchema,
} from '@core/services/mbc/models';
import { MBC_KEYS } from '@utils/constants/mbc-keys';

export interface ServiceRegistryServiceInterface {
  /** Get all registered service types */
  getAll(): Promise<ServiceType[]>;
  /** Get a service type by its unique identifier */
  getById(id: string): Promise<ServiceType | undefined>;
  /** Add a new service type to the registry */
  add(serviceType: ServiceType): Promise<void>;
  /** Update an existing service type's fields */
  update(id: string, updates: Partial<Omit<ServiceType, 'id'>>): Promise<void>;
  /** Remove a service type from the registry */
  remove(id: string): Promise<void>;
  /** Initialize the registry with defaults if it doesn't exist */
  initializeDefaults(): Promise<void>;
}

export const ServiceRegistryService = (
  deps: Pick<AwilixRegistry, 'keyValueStore'>,
): ServiceRegistryServiceInterface => {
  const { keyValueStore } = deps;

  const storeName = MBC_KEYS.MBC_STORE_NAME;
  const registryKey = MBC_KEYS.MBC_SERVICE_REGISTRY;

  const readRegistry = async (): Promise<ServiceType[]> => {
    const raw = await keyValueStore.get<ServiceType[]>(storeName, registryKey);

    if (!raw || !Array.isArray(raw)) {
      return [];
    }

    // Validate each entry, filter out corrupted ones
    return raw.filter((entry) => {
      const result = ServiceTypeFormSchema.safeParse(entry);
      return result.success;
    });
  };

  const writeRegistry = async (registry: ServiceType[]): Promise<void> => {
    await keyValueStore.set(storeName, registryKey, registry);
  };

  const getAll = async (): Promise<ServiceType[]> => {
    return readRegistry();
  };

  const getById = async (id: string): Promise<ServiceType | undefined> => {
    const registry = await readRegistry();
    return registry.find((st) => st.id === id);
  };

  const add = async (serviceType: ServiceType): Promise<void> => {
    // Validate the new service type
    const validation = ServiceTypeFormSchema.safeParse(serviceType);
    if (!validation.success) {
      const messages = validation.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new Error(`Invalid service type: ${messages}`);
    }

    const registry = await readRegistry();

    // Check for duplicate ID
    if (registry.some((st) => st.id === serviceType.id)) {
      throw new Error(
        `Service type with id "${serviceType.id}" already exists`,
      );
    }

    registry.push(serviceType);
    await writeRegistry(registry);
  };

  const update = async (
    id: string,
    updates: Partial<Omit<ServiceType, 'id'>>,
  ): Promise<void> => {
    const registry = await readRegistry();
    const index = registry.findIndex((st) => st.id === id);

    if (index === -1) {
      throw new Error(`Service type with id "${id}" not found`);
    }

    const updated: ServiceType = { ...registry[index], ...updates, id };

    // Validate the updated entry
    const validation = ServiceTypeFormSchema.safeParse(updated);
    if (!validation.success) {
      const messages = validation.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new Error(`Invalid service type after update: ${messages}`);
    }

    registry[index] = updated;
    await writeRegistry(registry);
  };

  const remove = async (id: string): Promise<void> => {
    const registry = await readRegistry();
    const index = registry.findIndex((st) => st.id === id);

    if (index === -1) {
      throw new Error(`Service type with id "${id}" not found`);
    }

    registry.splice(index, 1);
    await writeRegistry(registry);
  };

  const initializeDefaults = async (): Promise<void> => {
    const registry = await readRegistry();

    if (registry.length === 0) {
      await writeRegistry([DEFAULT_PARKING_SERVICE]);
    }
  };

  return { getAll, getById, add, update, remove, initializeDefaults };
};
