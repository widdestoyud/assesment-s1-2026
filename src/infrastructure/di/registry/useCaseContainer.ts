import { AwilixContainer } from 'awilix';

export function registerUseCaseModules(_container: AwilixContainer) {
  // MBC use cases will be registered in mbcUseCaseContainer.ts
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Placeholder for non-MBC use cases; kept for structural consistency with other container modules
export interface UseCaseContainerInterface {}
