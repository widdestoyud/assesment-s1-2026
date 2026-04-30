import type { AwilixRegistry } from '@di/container';
import type { ServiceType } from '@core/services/mbc/models';

export interface ManageServiceRegistryUseCaseInterface {
  getAll(): Promise<ServiceType[]>;
  add(serviceType: ServiceType): Promise<void>;
  update(id: string, updates: Partial<Omit<ServiceType, 'id'>>): Promise<void>;
  remove(id: string): Promise<void>;
  initializeDefaults(): Promise<void>;
}

export const ManageServiceRegistryUseCase = (
  deps: Pick<AwilixRegistry, 'serviceRegistryService'>,
): ManageServiceRegistryUseCaseInterface => {
  const { serviceRegistryService } = deps;

  let initialized = false;

  const ensureInitialized = async (): Promise<void> => {
    if (!initialized) {
      await serviceRegistryService.initializeDefaults();
      initialized = true;
    }
  };

  const getAll = async (): Promise<ServiceType[]> => {
    await ensureInitialized();
    return serviceRegistryService.getAll();
  };

  const add = async (serviceType: ServiceType): Promise<void> => {
    await ensureInitialized();
    return serviceRegistryService.add(serviceType);
  };

  const update = async (
    id: string,
    updates: Partial<Omit<ServiceType, 'id'>>,
  ): Promise<void> => {
    await ensureInitialized();
    return serviceRegistryService.update(id, updates);
  };

  const remove = async (id: string): Promise<void> => {
    await ensureInitialized();
    return serviceRegistryService.remove(id);
  };

  const initializeDefaults = async (): Promise<void> => {
    await serviceRegistryService.initializeDefaults();
    initialized = true;
  };

  return { getAll, add, update, remove, initializeDefaults };
};
