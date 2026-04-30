import { QueryClient } from '@tanstack/react-query';
import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locale/en';
import id from './locale/id';

/**
 * List of local translation
 */
const resources = {
  en: { tsel: en },
  id: { tsel: id },
};

/**
 * Normalize language code to 'id' or 'en'
 */
function normalizeLang(lang: string): string {
  const normalized = lang.toLowerCase().split('-')[0];
  return normalized === 'id' ? 'id' : 'en';
}

/**
 * initial i18n with our configuration
 *
 * @param _queryClient - kept for future WCMS integration
 */
export const initTranslation = (_queryClient: QueryClient) => {
  i18n
    .use(detector)
    .use(initReactI18next)
    .init({
      debug: false,
      fallbackLng: 'id',
      interpolation: {
        escapeValue: false,
      },
      resources,
      ns: ['tsel'],
      defaultNS: 'tsel',
      partialBundledLanguages: true,
      parseMissingKeyHandler: key => {
        const defaultLng = normalizeLang(
          localStorage.getItem('i18nextLng') ?? 'id'
        ) as keyof typeof resources;
        return (
          resources[defaultLng].tsel[
            key as keyof (typeof resources)['id']['tsel']
          ] ?? 'Loading Text...'
        );
      },
    });

  return i18n;
};

export default i18n;
