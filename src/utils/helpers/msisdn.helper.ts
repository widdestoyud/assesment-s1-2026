export const stripPhoneNumber = (number: string): string => {
  if (!number) {
    return '';
  }
  let phoneNumber = number;

  if (number.startsWith('62')) {
    phoneNumber = number.slice(2);
  } else if (number.startsWith('+62')) {
    phoneNumber = number.slice(3);
  } else if (number.startsWith('0062')) {
    phoneNumber = number.slice(4);
  } else if (number.startsWith('0')) {
    phoneNumber = number.slice(1);
  }
  return phoneNumber;
};

export const tselNumberRegex = () => {
  const acceptablePrefixes = [811, 812, 813, 821, 822, 823, 851, 852, 853];
  const minDigitsAfterPrefix = 6;
  const maxDigitsAfterPrefix = 8;
  const patternString = `(^0|^62)*(${acceptablePrefixes.join('|')})\\d{${minDigitsAfterPrefix},${maxDigitsAfterPrefix}}$`;
  return new RegExp(patternString);
};

export function getCountryCodePrefixedNumber(number: string): string {
  return '62' + stripPhoneNumber(number);
}

export const maskMsisdn = (msisdn: string) => {
  if (!msisdn) {
    return '';
  }
  const cleanMsisdn = stripPhoneNumber(msisdn);
  if (cleanMsisdn.length <= 9) {
    return msisdn;
  }
  const prefixedMsisdn = '+' + getCountryCodePrefixedNumber(cleanMsisdn);
  const result = `${prefixedMsisdn.substring(
    0,
    3
  )} ${prefixedMsisdn.substring(3, 6)}${prefixedMsisdn
    .substring(6, 10)
    .replace(/./gi, '*')}${prefixedMsisdn.substring(10)}`;
  return `${result}`;
};
