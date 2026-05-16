import { AwilixContainer, asValue } from 'awilix';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

export function registerLibraryModule(container: AwilixContainer) {
  container.register({
    useTranslation: asValue(useTranslation),
    useNavigate: asValue(useNavigate),
  });
}

export interface LibraryContainerInterface {
  useTranslation: typeof useTranslation;
  useNavigate: typeof useNavigate;
}
