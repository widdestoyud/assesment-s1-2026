import { InternalAxiosRequestConfig } from 'axios';
import config from '@src/infrastructure/config';
import {
  generateRequestHash,
  generateTransactionId,
} from './request.helper.ts';

export const embedHeaderRequest = async (
  axiosConfig: InternalAxiosRequestConfig
) => {
  console.log(axiosConfig.url);
  if (
    axiosConfig.url &&
    ![
      'v1/asset/web',
      'translation/v2/all/web/id',
      'translation/v2/all/web/en',
    ].includes(axiosConfig.url)
  ) {
    const transactionid = generateTransactionId();

    axiosConfig.headers['HASH'] = generateRequestHash(
      transactionid,
      axiosConfig.url
    );
    axiosConfig.headers['TRANSACTIONID'] = transactionid;
    axiosConfig.headers['CHANNELID'] = 'WEB';
    axiosConfig.headers['authserver'] = '2';
    axiosConfig.headers['mytelkomsel-web-app-version'] = config.appVersion;
    axiosConfig.headers['Accept'] = 'application/json';
    axiosConfig.headers['language'] = 'id';
  }
};

export const generateParallelHeader = (parallelName: string) => {
  return {
    'x-sprint-identifier': parallelName,
  };
};
