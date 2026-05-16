import { AwilixContainer, asValue } from 'awilix';
import helpers from '@utils/helpers';
import images from '@infra/images';

export function registerHelperModules(container: AwilixContainer) {
  container.register({
    helpers: asValue(helpers),
    images: asValue(images),
  });
}

export interface HelperContainerInterface {
  helpers: typeof helpers;
  images: typeof images;
}
