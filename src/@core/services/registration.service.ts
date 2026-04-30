import type { AxiosRequestConfig } from 'axios';
import type { HttpResponse } from '@core/protocols/http';
import type { AwilixRegistry } from '@di/container';

export interface RegistrationServiceInterface {
  checkStatus: (
    nik: string,
    nokk: string,
    msisdn: string
  ) => Promise<HttpResponse<CheckStatusResponseInterface>>;
  validateNik: (
    msisdn: string,
    nik: string,
    nokk: string,
    signature: string
  ) => Promise<HttpResponse<ValidateNikResponseInterface>>;
  registerPrepaid: (
    msisdn: string,
    nik: string,
    nokk: string,
    signature: string
  ) => Promise<HttpResponse<RegisterResponseInterface>>;
}

export interface ValidateNikSubmitInterface {
  msisdn: string;
  nik: string;
  nokk: string;
  signature: string;
}

export interface ValidateNikResponseInterface {
  nik: string;
  nokk: string;
  misisdn: string;
  signature: string;
}

export interface ValidateWithRetryResponseInterface {
  message?: string;
  valid?: boolean;
  signature: string;
}

export interface StatusServicesResponse {
  serviceType: string;
  msisdn: string;
}

export interface CheckStatusResponseInterface {
  nik: string;
  services: StatusServicesResponse[];
}

export interface RegisterResponseInterface {
  signature: string;
}

export const RegistrationService = ({
  http,
}: AwilixRegistry): RegistrationServiceInterface => {
  return {
    checkStatus: (nik, nokk, msisdn) => {
      const apiPath = 'prepaid-registration/registration-detail';
      return http.post<
        HttpResponse<CheckStatusResponseInterface>,
        { msisdn: string; nik: string; nokk: string },
        AxiosRequestConfig
      >(apiPath, { msisdn, nik, nokk });
    },
    validateNik: (msisdn, nik, nokk, signature) => {
      const apiPath = 'prepaid-registration/dukcapil';
      return http.post<
        HttpResponse<ValidateNikResponseInterface>,
        ValidateNikSubmitInterface,
        AxiosRequestConfig
      >(apiPath, {
        msisdn,
        nik,
        nokk,
        signature,
      });
    },
    registerPrepaid: (msisdn, nik, nokk, signature) => {
      const apiPath = 'prepaid-registration/register';
      return http.post<
        HttpResponse<RegisterResponseInterface>,
        ValidateNikSubmitInterface,
        AxiosRequestConfig
      >(apiPath, {
        msisdn,
        nik,
        nokk,
        signature,
      });
    },
  };
};
