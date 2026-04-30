import { InternalAxiosRequestConfig } from 'axios';
import { embedHeaderRequest } from '@utils/helpers/header.helper.ts';

export const requestInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig<any>> => {
  await embedHeaderRequest(config);

  return config;
};
