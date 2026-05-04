import { AwilixContainer, asValue } from 'awilix';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export function registerLibraryModule(container: AwilixContainer) {
  container.register({
    zod: asValue(z),
    useTranslation: asValue(useTranslation),
  });
}

export interface LibraryContainerInterface {
  zod: typeof z;
  useTranslation: typeof useTranslation;
}
