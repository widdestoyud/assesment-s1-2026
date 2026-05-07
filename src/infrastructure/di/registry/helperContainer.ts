import { AwilixContainer, asValue } from 'awilix';
import helpers from '@utils/helpers';
import { MBC_KEYS } from '@utils/constants';
import images from '@infra/images';

export function registerHelperModules(container: AwilixContainer) {
  container.register({
    helpers: asValue(helpers),
    MBC_KEYS: asValue(MBC_KEYS),
    images: asValue(images),
  });
}

export interface HelperContainerInterface {
  helpers: typeof helpers;
  MBC_KEYS: typeof MBC_KEYS;
  images: typeof images;
}
