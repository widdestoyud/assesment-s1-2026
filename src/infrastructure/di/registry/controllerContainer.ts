import { AwilixContainer } from 'awilix';

export function registerControllerModules(_container: AwilixContainer) {
  // MBC controllers will be registered in mbcControllerContainer.ts
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Placeholder for non-MBC controllers; kept for structural consistency with other container modules
export interface ControllerContainerInterface {}
