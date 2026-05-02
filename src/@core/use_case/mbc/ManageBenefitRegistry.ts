import type { AwilixRegistry } from '@di/container';
import type { BenefitType } from '@core/services/mbc/models';

export interface ManageBenefitRegistryUseCaseInterface {
  getAll(): Promise<BenefitType[]>;
  add(benefitType: BenefitType): Promise<void>;
  update(id: string, updates: Partial<Omit<BenefitType, 'id'>>): Promise<void>;
  remove(id: string): Promise<void>;
  initializeDefaults(): Promise<void>;
}

export const ManageBenefitRegistryUseCase = (
  deps: Pick<AwilixRegistry, 'benefitRegistryService'>,
): ManageBenefitRegistryUseCaseInterface => {
  const { benefitRegistryService } = deps;

  let initialized = false;

  const ensureInitialized = async (): Promise<void> => {
    if (!initialized) {
      await benefitRegistryService.initializeDefaults();
      initialized = true;
    }
  };

  const getAll = async (): Promise<BenefitType[]> => {
    await ensureInitialized();
    return benefitRegistryService.getAll();
  };

  const add = async (benefitType: BenefitType): Promise<void> => {
    await ensureInitialized();
    return benefitRegistryService.add(benefitType);
  };

  const update = async (
    id: string,
    updates: Partial<Omit<BenefitType, 'id'>>,
  ): Promise<void> => {
    await ensureInitialized();
    return benefitRegistryService.update(id, updates);
  };

  const remove = async (id: string): Promise<void> => {
    await ensureInitialized();
    return benefitRegistryService.remove(id);
  };

  const initializeDefaults = async (): Promise<void> => {
    await benefitRegistryService.initializeDefaults();
    initialized = true;
  };

  return { getAll, add, update, remove, initializeDefaults };
};
