import { describe, expect, it } from 'vitest';
import {
  generateTypeMsisdn,
  maskNik,
  normalizeLang,
  toSlug,
} from '../string.helper';

describe('normalizeLang', () => {
  it('removes region code and converts to lowercase', () => {
    expect(normalizeLang('en-US')).toBe('en');
    expect(normalizeLang('FR-CA')).toBe('fr');
  });

  it('handles already normalized languages', () => {
    expect(normalizeLang('es')).toBe('es');
    expect(normalizeLang('ZH')).toBe('zh');
  });

  it('handles multi-hyphen strings', () => {
    expect(normalizeLang('en-Latn-US')).toBe('en');
    expect(normalizeLang('de-DE-1996')).toBe('de');
  });

  it('handles empty string', () => {
    expect(normalizeLang('')).toBe('');
  });

  it('handles strings without hyphens', () => {
    expect(normalizeLang('日本語')).toBe('日本語');
  });
});

describe('toSlug', () => {
  it('converts text to URL-friendly slug', () => {
    expect(toSlug('Hello World!')).toBe('hello-world');
    expect(toSlug('  Trim Me  ')).toBe('trim-me');
  });

  it('handles special characters and accents', () => {
    expect(toSlug('Àccéntéd Chäräctérs')).toBe('accented-characters');
    expect(toSlug('ñandú çafé')).toBe('nandu-cafe');
  });

  it('handles punctuation and symbols', () => {
    expect(toSlug('Test / Slash : Colon ; Semicolon')).toBe(
      'test-slash-colon-semicolon'
    );
    expect(toSlug('Price: $100.99')).toBe('price-10099');
  });

  it('handles consecutive spaces and dashes', () => {
    expect(toSlug('Multiple   Spaces')).toBe('multiple-spaces');
    expect(toSlug('Already---dashed---text')).toBe('already-dashed-text');
    expect(toSlug('-Leading and trailing-')).toBe('leading-and-trailing');
  });

  it('handles empty string', () => {
    expect(toSlug('')).toBe('');
  });

  it('handles special cases', () => {
    expect(toSlug('汉字/漢字')).toBe('');
    expect(toSlug('💻 Emoji Test 😊')).toBe('emoji-test');
  });
});

describe('generateTypeMsisdn', () => {
  it('returns postpaid type string', () => {
    expect(generateTypeMsisdn('postpaid')).toBe(
      'web_register_check_status_result_postpaid_number'
    );
    expect(generateTypeMsisdn('POSTPAID')).toBe(
      'web_register_check_status_result_postpaid_number'
    );
    expect(generateTypeMsisdn('PostPaid')).toBe(
      'web_register_check_status_result_postpaid_number'
    );
  });

  it('returns prepaid type string for non-postpaid', () => {
    expect(generateTypeMsisdn('prepaid')).toBe(
      'web_register_check_status_result_prepaid_number'
    );
    expect(generateTypeMsisdn('other')).toBe(
      'web_register_check_status_result_prepaid_number'
    );
    expect(generateTypeMsisdn('')).toBe(
      'web_register_check_status_result_prepaid_number'
    );
  });

  it('handles case variations', () => {
    expect(generateTypeMsisdn('pOsTpAiD')).toBe(
      'web_register_check_status_result_postpaid_number'
    );
    expect(generateTypeMsisdn('PREPAID')).toBe(
      'web_register_check_status_result_prepaid_number'
    );
  });

  it('handles null and undefined', () => {
    expect(generateTypeMsisdn(null as any)).toBe(
      'web_register_check_status_result_prepaid_number'
    );
    expect(generateTypeMsisdn(undefined as any)).toBe(
      'web_register_check_status_result_prepaid_number'
    );
  });
});

describe('maskNik', () => {
  it('masks NIK with asterisks', () => {
    expect(maskNik('1234567890123456')).toBe('12345*******3456');
    expect(maskNik('ABCDEFGH12345678')).toBe('ABCDE*******5678');
  });

  it('handles shorter than 13-character NIKs', () => {
    expect(maskNik('1234567')).toBe('1234567'); // Too short to mask
    expect(maskNik('123456789012')).toBe('123456789012');
  });

  it('handles exactly 13-character NIKs', () => {
    expect(maskNik('1234567890123')).toBe('1234567890123');
  });

  it('handles empty and invalid inputs', () => {
    expect(maskNik('')).toBe('');
    expect(maskNik(null as any)).toBe('');
    expect(maskNik(undefined as any)).toBe('');
  });

  it('preserves first 5 and last 4 characters', () => {
    const nik = 'A1B2C3D4E5F6G7H8';
    const masked = maskNik(nik);
    expect(masked.startsWith('A1B2C')).toBe(true);
    expect(masked.endsWith('G7H8')).toBe(true);
    expect(masked.length).toBe(16); // 5 + 7 asterisks + 4
  });
});
