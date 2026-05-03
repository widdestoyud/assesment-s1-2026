import type { AwilixRegistry } from '@di/container';
import type { BenefitType } from '@core/services/mbc/models';

import {
  DEFAULT_PARKING_BENEFIT,
  BenefitTypeFormSchema,
} from '@core/services/mbc/models';
import { MBC_KEYS } from '@utils/constants/mbc-keys';

export interface BenefitRegistryServiceInterface {
  /** Get all registered benefit types */
  getAll(): Promise<BenefitType[]>;
  /** Get a benefit type by its unique identifier */
  getById(id: string): Promise<BenefitType | undefined>;
  /** Add a new benefit type to the registry */
  add(benefitType: BenefitType): Promise<void>;
  /** Update an existing benefit type's fields */
  update(id: string, updates: Partial<Omit<BenefitType, 'id'>>): Promise<void>;
  /** Remove a benefit type from the registry */
  remove(id: string): Promise<void>;
  /** Initialize the registry with defaults if it doesn't exist */
  initializeDefaults(): Promise<void>;
}

export const BenefitRegistryService = (
  deps: Pick<AwilixRegistry, 'keyValueStore'>,
): BenefitRegistryServiceInterface => {
  const { keyValueStore } = deps;

  const storeName = MBC_KEYS.MBC_STORE_NAME;
  const registryKey = MBC_KEYS.MBC_SERVICE_REGISTRY;

  const readRegistry = async (): Promise<BenefitType[]> => {
    const raw = await keyValueStore.get<BenefitType[]>(storeName, registryKey);

    if (!raw || !Array.isArray(raw)) {
      return [];
    }

    // Validate each entry, filter out corrupted ones
    return raw.filter((entry) => {
      const result = BenefitTypeFormSchema.safeParse(entry);
      return result.success;
    });
  };

  const writeRegistry = async (registry: BenefitType[]): Promise<void> => {
    await keyValueStore.set(storeName, registryKey, registry);
  };

  const getAll = async (): Promise<BenefitType[]> => {
    return readRegistry();
  };

  const getById = async (id: string): Promise<BenefitType | undefined> => {
    const registry = await readRegistry();
    return registry.find((st) => st.id === id);
  };

  const add = async (benefitType: BenefitType): Promise<void> => {
    // Validate the new benefit type
    const validation = BenefitTypeFormSchema.safeParse(benefitType);
    if (!validation.success) {
      throw new Error('mbc_error_invalid_benefit_type');
    }

    const registry = await readRegistry();

    // Check for duplicate ID
    if (registry.some((st) => st.id === benefitType.id)) {
      throw new Error('mbc_error_benefit_type_duplicate');
    }

    registry.push(benefitType);
    await writeRegistry(registry);
  };

  const update = async (
    id: string,
    updates: Partial<Omit<BenefitType, 'id'>>,
  ): Promise<void> => {
    const registry = await readRegistry();
    const index = registry.findIndex((st) => st.id === id);

    if (index === -1) {
      throw new Error('mbc_error_benefit_type_not_found');
    }

    const updated: BenefitType = { ...registry[index], ...updates, id };

    // Validate the updated entry
    const validation = BenefitTypeFormSchema.safeParse(updated);
    if (!validation.success) {
      throw new Error('mbc_error_invalid_benefit_type');
    }

    registry[index] = updated;
    await writeRegistry(registry);
  };

  const remove = async (id: string): Promise<void> => {
    const registry = await readRegistry();
    const index = registry.findIndex((st) => st.id === id);

    if (index === -1) {
      throw new Error('mbc_error_benefit_type_not_found');
    }

    registry.splice(index, 1);
    await writeRegistry(registry);
  };

  const initializeDefaults = async (): Promise<void> => {
    const registry = await readRegistry();

    if (registry.length === 0) {
      await writeRegistry([DEFAULT_PARKING_BENEFIT]);
    }
  };

  return { getAll, getById, add, update, remove, initializeDefaults };
};
