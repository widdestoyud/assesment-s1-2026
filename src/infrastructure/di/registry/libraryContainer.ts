import { AwilixContainer, asValue } from 'awilix';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

export function registerLibraryModule(container: AwilixContainer) {
  container.register({
    zod: asValue(z),
    useTranslation: asValue(useTranslation),
    useNavigate: asValue(useNavigate),
  });
}

export interface LibraryContainerInterface {
  zod: typeof z;
  useTranslation: typeof useTranslation;
  useNavigate: typeof useNavigate;
}
