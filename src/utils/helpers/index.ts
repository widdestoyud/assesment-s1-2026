import { decryptAuthHeader, encryptAuthHeader } from './encrypt.helper.ts';
import { generateParallelHeader } from './header.helper.ts';
import {
  formatDuration,
  formatIDR,
  getCurrentTimestamp,
} from './mbc.helper.ts';
import {
  getCountryCodePrefixedNumber,
  maskMsisdn,
  stripPhoneNumber,
  tselNumberRegex,
} from './msisdn.helper.ts';
import { generateTransactionId } from './request.helper.ts';
import {
  generateTypeMsisdn,
  maskNik,
  normalizeLang,
  toSlug,
} from './string.helper.ts';
import { maxLengthInputNumberLimit } from './validation.helper.ts';

export default {
  encryptAuthHeader,
  decryptAuthHeader,
  normalizeLang,
  stripPhoneNumber,
  getCountryCodePrefixedNumber,
  generateTransactionId,
  toSlug,
  tselNumberRegex,
  maxLengthInputNumberLimit,
  generateParallelHeader,
  generateTypeMsisdn,
  maskMsisdn,
  maskNik,
  formatIDR,
  formatDuration,
  getCurrentTimestamp,
};
