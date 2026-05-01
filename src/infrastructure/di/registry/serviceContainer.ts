import { AwilixContainer } from 'awilix';

export function registerServiceModules(_container: AwilixContainer) {
  // MBC services will be registered in mbcServiceContainer.ts
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Placeholder for non-MBC services; kept for structural consistency with other container modules
export interface ServiceContainerInterface {}
