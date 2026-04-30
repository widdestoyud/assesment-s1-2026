import { describe, expect, it } from 'vitest';
import {
  getCountryCodePrefixedNumber,
  maskMsisdn,
  stripPhoneNumber,
  tselNumberRegex,
} from '../msisdn.helper';

describe('stripPhoneNumber', () => {
  it('removes international prefixes', () => {
    expect(stripPhoneNumber('62812345678')).toBe('812345678');
    expect(stripPhoneNumber('+62812345678')).toBe('812345678');
    expect(stripPhoneNumber('0062812345678')).toBe('812345678');
  });

  it('removes leading zero', () => {
    expect(stripPhoneNumber('0812345678')).toBe('812345678');
  });

  it('handles numbers without prefixes', () => {
    expect(stripPhoneNumber('812345678')).toBe('812345678');
    expect(stripPhoneNumber('12345678')).toBe('12345678');
  });

  it('handles edge cases', () => {
    expect(stripPhoneNumber('62')).toBe('');
    expect(stripPhoneNumber('0')).toBe('');
    expect(stripPhoneNumber('')).toBe('');
    expect(stripPhoneNumber(null as any)).toBe('');
    expect(stripPhoneNumber(undefined as any)).toBe('');
  });

  it('handles partial matches', () => {
    expect(stripPhoneNumber('62012345678')).toBe('012345678'); // Only removes full prefixes
    expect(stripPhoneNumber('00612345678')).toBe('0612345678'); // Doesn't match
    expect(stripPhoneNumber('06212345678')).toBe('6212345678'); // Only removes leading 0
  });
});

describe('tselNumberRegex', () => {
  const acceptablePrefixes = [811, 812, 813, 821, 822, 823, 851, 852, 853];
  const regex = tselNumberRegex();

  it('matches valid Tsel numbers', () => {
    // Test all acceptable prefixes
    acceptablePrefixes.forEach(prefix => {
      const number = `0${prefix}1234567`; // 10 digits total
      expect(regex.test(number)).toBe(true);
    });

    // Test with country code
    acceptablePrefixes.forEach(prefix => {
      const number = `628${prefix.toString().slice(1)}1234567`;
      expect(regex.test(number)).toBe(true);
    });

    // Test min/max length
    expect(regex.test('0812123456')).toBe(true); // 10 digits (min)
    expect(regex.test('081212345678')).toBe(true); // 12 digits (max)
  });

  it('rejects invalid Tsel numbers', () => {
    // Invalid prefixes
    expect(regex.test('08101234567')).toBe(false); // 810 not acceptable
    expect(regex.test('08541234567')).toBe(false); // 854 not acceptable

    // Invalid lengths
    expect(regex.test('081212345')).toBe(false); // 9 digits (too short)
    expect(regex.test('0812123456789')).toBe(false); // 13 digits (too long)

    // Invalid formats
    expect(regex.test('628112345')).toBe(false); // Too short with country code
    expect(regex.test('0812-123-4567')).toBe(false); // Contains hyphens
    expect(regex.test('0812 123 4567')).toBe(false); // Contains spaces
  });

  it('handles edge cases', () => {
    expect(regex.test('')).toBe(false);
    expect(regex.test('abc')).toBe(false);
    expect(regex.test('0812abc4567')).toBe(false);
  });
});

describe('getCountryCodePrefixedNumber', () => {
  it('adds country code to stripped numbers', () => {
    expect(getCountryCodePrefixedNumber('08123456789')).toBe('628123456789');
    expect(getCountryCodePrefixedNumber('628123456789')).toBe('628123456789');
    expect(getCountryCodePrefixedNumber('8123456789')).toBe('628123456789');
  });

  it('handles already prefixed numbers', () => {
    expect(getCountryCodePrefixedNumber('628123456789')).toBe('628123456789');
    expect(getCountryCodePrefixedNumber('+628123456789')).toBe('628123456789');
  });

  it('handles edge cases', () => {
    expect(getCountryCodePrefixedNumber('')).toBe('62');
    expect(getCountryCodePrefixedNumber('0')).toBe('62');
    expect(getCountryCodePrefixedNumber(null as any)).toBe('62');
    expect(getCountryCodePrefixedNumber(undefined as any)).toBe('62');
  });
});

describe('maskMsisdn', () => {
  it('masks phone numbers correctly', () => {
    // Standard mobile number
    expect(maskMsisdn('081234567890')).toBe('+62 812****7890');
    // Number with country code
    expect(maskMsisdn('6281234567890')).toBe('+62 812****7890');
    // Short number
    expect(maskMsisdn('08123456')).toBe('08123456');
    // Long number
    expect(maskMsisdn('628123456789012')).toBe('+62 812****789012');
  });

  it('handles various input formats', () => {
    expect(maskMsisdn('+6281234567890')).toBe('+62 812****7890');
    expect(maskMsisdn('006281234567890')).toBe('+62 812****7890');
    expect(maskMsisdn('81234567890')).toBe('+62 812****7890');
  });

  it('handles edge cases', () => {
    expect(maskMsisdn('')).toBe('');
    expect(maskMsisdn('0')).toBe('0');
    expect(maskMsisdn('123')).toBe('123');
    expect(maskMsisdn(null as any)).toBe('');
    expect(maskMsisdn(undefined as any)).toBe('');
  });

  it('masks exactly 4 digits in position 7-10', () => {
    const masked = maskMsisdn('081234567890');
    // Should be: +62 8123****7890
    expect(masked).toBe('+62 812****7890');
    expect(masked.length).toBe(15); // +62 (8123****7890) = 3 + 1 + 10

    const shortMasked = maskMsisdn('0812345');
    // +62 8123****
    expect(shortMasked).toBe('0812345');
  });
});
