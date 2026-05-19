import { AwilixContainer, asValue } from 'awilix';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

export function registerLibraryModule(container: AwilixContainer) {
  container.register({
    useTranslation: asValue(useTranslation),
    useNavigate: asValue(useNavigate),
    useForm: asValue(useForm),
  });
}

export interface LibraryContainerInterface {
  useTranslation: typeof useTranslation;
  useNavigate: typeof useNavigate;
  useForm: typeof useForm;
}
