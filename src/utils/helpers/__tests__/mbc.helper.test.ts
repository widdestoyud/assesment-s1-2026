import { describe, expect, it } from 'vitest';

import {
  formatIDR,
  formatDuration,
  formatThousands,
  stripThousands,
} from '../mbc.helper';

describe('mbc.helper', () => {
  describe('formatIDR', () => {
    it('formats 0 as "Rp 0"', () => {
      expect(formatIDR(0)).toBe('Rp 0');
    });

    it('formats 2000 as "Rp 2.000"', () => {
      expect(formatIDR(2000)).toBe('Rp 2.000');
    });

    it('formats negative amount with minus prefix', () => {
      expect(formatIDR(-5000)).toBe('-Rp 5.000');
    });

    it('formats large number with correct separators', () => {
      expect(formatIDR(1000000)).toBe('Rp 1.000.000');
    });
  });

  describe('formatDuration', () => {
    it('returns "0 menit" when difference is 0', () => {
      const time = '2024-01-01T10:00:00.000Z';
      expect(formatDuration(time, time)).toBe('0 menit');
    });

    it('returns only hours when minutes are 0', () => {
      const checkIn = '2024-01-01T10:00:00.000Z';
      const checkOut = '2024-01-01T12:00:00.000Z';
      expect(formatDuration(checkIn, checkOut)).toBe('2 jam');
    });

    it('returns only minutes when hours are 0', () => {
      const checkIn = '2024-01-01T10:00:00.000Z';
      const checkOut = '2024-01-01T10:30:00.000Z';
      expect(formatDuration(checkIn, checkOut)).toBe('30 menit');
    });

    it('returns hours and minutes combined', () => {
      const checkIn = '2024-01-01T10:00:00.000Z';
      const checkOut = '2024-01-01T12:30:00.000Z';
      expect(formatDuration(checkIn, checkOut)).toBe('2 jam 30 menit');
    });

    it('clamps negative difference to 0 menit', () => {
      const checkIn = '2024-01-01T12:00:00.000Z';
      const checkOut = '2024-01-01T10:00:00.000Z';
      expect(formatDuration(checkIn, checkOut)).toBe('0 menit');
    });
  });

  describe('formatThousands', () => {
    it('returns empty string for empty input', () => {
      expect(formatThousands('')).toBe('');
    });

    it('formats numeric string with dot separator', () => {
      expect(formatThousands('10000')).toBe('10.000');
    });

    it('returns empty string for non-numeric input', () => {
      expect(formatThousands('abc')).toBe('');
    });

    it('strips non-digit characters before formatting', () => {
      expect(formatThousands('10.000')).toBe('10.000');
    });

    it('formats small numbers without separator', () => {
      expect(formatThousands('500')).toBe('500');
    });
  });

  describe('stripThousands', () => {
    it('removes dot separators from formatted string', () => {
      expect(stripThousands('10.000')).toBe('10000');
    });

    it('handles string without dots', () => {
      expect(stripThousands('5000')).toBe('5000');
    });

    it('removes multiple dots', () => {
      expect(stripThousands('1.000.000')).toBe('1000000');
    });
  });
});
