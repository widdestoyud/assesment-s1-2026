import { zodResolver } from '@hookform/resolvers/zod';
import { AwilixContainer, asValue } from 'awilix';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import zod from 'zod';
import config from '@src/infrastructure/config';
import images from '@src/infrastructure/images';

export function registerLibraryModule(container: AwilixContainer) {
  container.register({
    useTranslation: asValue(useTranslation),
    useFormHook: asValue(useForm),
    zod: asValue(zod),
    zodResolver: asValue(zodResolver),
    config: asValue(config),
    images: asValue(images),
  });
}

export type configTypes = typeof config;
export type imageTypes = typeof images;

export interface LibraryContainerInterface {
  useTranslation: typeof useTranslation;
  useFormHook: typeof useForm;
  zodResolver: typeof zodResolver;
  zod: typeof zod;
  config: configTypes;
  images: imageTypes;
}
