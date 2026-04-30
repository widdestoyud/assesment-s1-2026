import dayjs from 'dayjs';
import { sha224 } from 'js-sha256';
import { jwtDecode } from 'jwt-decode';
import config from '@src/infrastructure/config';
import { getCountryCodePrefixedNumber } from './msisdn.helper.ts';

export const generateTransactionId = (token?: string): string => {
  const appId = 'A302';
  const msisdn = getMSISDNFromToken(token);
  const msisdnString = msisdn ?? '00000';
  const msisdnStripped = msisdnString.substring(msisdnString.length - 5);
  const timeStamp = dayjs().format('YYMMDDHHmmssSSS');
  const changeableDigit = '0';

  return appId + timeStamp + msisdnStripped + changeableDigit;
};

export function getMSISDNFromToken(token?: string): string | null {
  if (token) {
    const payload = jwtDecode<any>(token);
    if (payload) {
      if (payload?.profile?.msisdn) {
        return payload.profile.msisdn;
      }
      if (payload?.msisdn) {
        return getCountryCodePrefixedNumber(payload.msisdn);
      }
    }
  }
  return null;
}

export const generateRequestHash = (
  transactionId: string,
  url: string
): string => {
  const appVersion = config.appVersion;
  const hashKey = config.encrypt.hashKey;
  const endpoint = url.replace(/\?[^\r\n]*$/, '');
  const plain = transactionId + hashKey + endpoint + appVersion;
  return sha224(plain);
};
