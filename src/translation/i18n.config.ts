import { QueryClient } from '@tanstack/react-query';
import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import {
  TranslationResource,
  fetchTranslations,
} from '@src/infrastructure/http/translation';
import { normalizeLang } from '@utils/helpers/string.helper.ts';
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
 * Function to fetch WCMS translation
 * initiated in main.tsx
 *
 * @param queryClient
 */
const fetchWcms = (queryClient: QueryClient) => ({
  type: 'backend' as const,
  read: async (
    language: string,
    _namespace: string,
    callback: (error: any, data: any) => void
  ) => {
    let currentLang = normalizeLang(language).toLowerCase();
    if (currentLang !== 'id' && currentLang !== 'en') {
      currentLang = 'en';
    }
    try {
      const translations = await queryClient.fetchQuery({
        queryKey: ['web-translation', currentLang],
        queryFn: () => fetchTranslations(currentLang),
        gcTime: 1000 * 60 * 60 * 24 * 3,
        staleTime: 1000 * 60 * 15,
      });
      callback(null, translations);
    } catch (error) {
      console.error('Failed to load translations:', error);
      callback(
        null,
        resources[currentLang as keyof typeof resources].tsel ||
          resources.id.tsel
      );
    }
  },
});

/**
 * initial i18n with our configuration
 * DO NOT add resources into configuration
 * or server side translation fetch will not be called
 *
 * @param queryClient
 */
export const initTranslation = (queryClient: QueryClient) => {
  i18n
    .use(detector)
    .use(initReactI18next)
    .use(fetchWcms(queryClient))
    .init({
      debug: false,
      fallbackLng: 'id',
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: '{{lng}}',
      },
      ns: ['tsel'],
      defaultNS: 'tsel',
      partialBundledLanguages: true,
      parseMissingKeyHandler: key => {
        /**
         * Load and find in local file if WCMS key not found
         * and return default value Loading Text if not registered everywhere
         */
        const defaultLng = normalizeLang(
          localStorage.getItem('i18nextLng') ?? 'id'
        ) as keyof typeof resources;
        return (
          resources[defaultLng].tsel[key as keyof TranslationResource] ??
          'Loading Text...'
        );
      },
    });

  return i18n;
};

export default i18n;
