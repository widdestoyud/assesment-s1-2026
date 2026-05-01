import { AwilixContainer } from 'awilix';

export function registerTanstackModule(_container: AwilixContainer) {
  // MBC is offline-first, no TanStack Query needed for API calls
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Placeholder for TanStack Query registrations; kept for structural consistency with other container modules
export interface TanstackContainerInterface {}
