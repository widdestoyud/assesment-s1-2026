import { AxiosRequestConfig } from 'axios';
import type { HttpResponse } from '@core/protocols/http';
import type { AwilixRegistry } from '@di/container';

export interface MsisdnServiceInterface {
  checkEligibility: (
    msisdn: string,
    esim: boolean
  ) => Promise<HttpResponse<EligibilityResponseInterface>>;

  validateOtp: (
    msisdn: string,
    pin: string,
    signature: string
  ) => Promise<HttpResponse<OtpResponseInterface>>;
}

export interface EligibilitySubmitInterface {
  msisdn: string;
  esim: boolean;
}

export interface EligibilityResponseInterface {
  msisdn: string;
  signature: string;
  eligibility: boolean;
}

export interface OtpSubmitInterface {
  msisdn: string;
  pin: string;
  signature: string;
}

export interface OtpResponseInterface {
  valid: string;
  signature: string;
}

export const MsisdnService = ({
  http,
}: AwilixRegistry): MsisdnServiceInterface => {
  return {
    checkEligibility: (msisdn, esim) => {
      const apiPath = 'prepaid-registration/eligible';
      return http.post<
        HttpResponse<EligibilityResponseInterface>,
        EligibilitySubmitInterface,
        AxiosRequestConfig
      >(apiPath, {
        msisdn,
        esim,
      });
    },
    validateOtp: (msisdn, pin, signature) => {
      const apiPath = 'prepaid-registration/otp/validate';
      return http.post<
        HttpResponse<OtpResponseInterface>,
        OtpSubmitInterface,
        AxiosRequestConfig
      >(apiPath, {
        msisdn,
        pin,
        signature,
      });
    },
  };
};
