import { AwilixContainer, asValue } from 'awilix';
import { z } from 'zod';

export function registerLibraryModule(container: AwilixContainer) {
  container.register({
    zod: asValue(z),
  });
}

export interface LibraryContainerInterface {
  zod: typeof z;
}
