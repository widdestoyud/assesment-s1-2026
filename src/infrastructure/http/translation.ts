import { AxiosRequestConfig } from 'axios';
import { TranslationInterface } from '@core/services/config.service.ts';
import config from '@src/infrastructure/config.ts';
import axiosAdapter from '@src/infrastructure/http/axiosAdapter.ts';
import enTranslations from '@src/translation/locale/en';
import idTranslations from '@src/translation/locale/id';
import { requestInterceptor } from '@utils/interceptors/requestInterceptor.ts';

export type TranslationResource = typeof idTranslations;

export const fetchTranslations = async (
  lng: string
): Promise<TranslationResource> => {
  // Fallback to local translations
  const fallbackTranslations: TranslationInterface = {
    id: idTranslations,
    en: enTranslations,
  };
  try {
    const axios = axiosAdapter({
      requestInterceptor: requestInterceptor,
      refreshInterceptor: undefined,
    });

    const response = await axios.get<TranslationInterface, AxiosRequestConfig>(
      `translation/v2/all/web/${lng}`,
      {
        baseURL: config.api.wcmsUrl,
      }
    );
    return (
      response[lng as keyof TranslationInterface] ??
      fallbackTranslations[lng as keyof typeof fallbackTranslations] ??
      idTranslations
    );
  } catch (error) {
    console.info(
      `Failed to fetch translations for ${lng}, using fallback`,
      error
    );

    return (
      fallbackTranslations[lng as keyof typeof fallbackTranslations] ??
      idTranslations
    );
  }
};
