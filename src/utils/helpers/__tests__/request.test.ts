import dayjs from 'dayjs';
import { sha224 } from 'js-sha256';
import { jwtDecode } from 'jwt-decode';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import config from '@src/infrastructure/config';
import {
  generateRequestHash,
  generateTransactionId,
  getMSISDNFromToken,
} from '../request.helper';

// Mock external dependencies
vi.mock('@tanstack/react-query', () => ({
  QueryCache: vi.fn(() => ({
    clear: vi.fn(),
  })),
}));

vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '240101120000000'),
  })),
}));

vi.mock('js-sha256', () => ({
  sha224: vi.fn(() => 'mock-hash-value'),
}));

vi.mock('jwt-decode', () => ({
  default: vi.fn(),
  jwtDecode: vi.fn(),
}));

vi.mock('@src/infrastructure/config', () => ({
  default: {
    appVersion: '1.0.0',
    encrypt: {
      hashKey: 'secret-key',
    },
  },
}));

vi.mock('@src/infrastructure/storage/webStorageAdapter', () => ({
  webStorageAdapter: {
    clear: vi.fn(),
  },
}));

describe('generateTransactionId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates transaction ID with valid token', () => {
    // Mock token with MSISDN
    vi.mocked(jwtDecode).mockReturnValue({
      profile: { msisdn: '81234567890' },
    });

    const transactionId = generateTransactionId('');

    expect(transactionId).toBe('A302240101120000000000000');
    expect(dayjs).toHaveBeenCalled();
  });

  it('uses default values when token is invalid', () => {
    vi.mocked(jwtDecode).mockReturnValue({});

    const transactionId = generateTransactionId('invalid-token');

    expect(transactionId).toBe('A302240101120000000000000');
  });

  it('uses msisdn directly when profile not available', () => {
    vi.mocked(jwtDecode).mockReturnValue({ msisdn: '81234567890' });

    const transactionId = generateTransactionId('valid-token');

    expect(transactionId).toBe('A302240101120000000678900');
    expect(vi.mocked(jwtDecode)).toHaveBeenCalledWith('valid-token');
  });

  it('handles no token', () => {
    const transactionId = generateTransactionId();

    expect(transactionId).toBe('A302240101120000000000000');
    expect(jwtDecode).not.toHaveBeenCalled();
  });

  it('uses last 5 digits of MSISDN', () => {
    vi.mocked(jwtDecode).mockReturnValue({
      profile: { msisdn: '6281234567890' },
    });

    const transactionId = generateTransactionId('valid-token');

    expect(transactionId).toBe('A302240101120000000678900');
  });
});

describe('getMSISDNFromToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns MSISDN from profile', () => {
    vi.mocked(jwtDecode).mockReturnValue({
      profile: { msisdn: '81234567890' },
    });

    const msisdn = getMSISDNFromToken('valid-token');

    expect(msisdn).toBe('81234567890');
  });

  it('returns formatted MSISDN when not in profile', () => {
    vi.mocked(jwtDecode).mockReturnValue({
      msisdn: '081234567890',
    });

    const msisdn = getMSISDNFromToken('valid-token');

    expect(msisdn).toBe('6281234567890');
  });

  it('returns null for invalid token', () => {
    vi.mocked(jwtDecode).mockImplementation(() => {
      return null;
    });

    const msisdn = getMSISDNFromToken('invalid-token');

    expect(msisdn).toBeNull();
  });

  it('returns null when no MSISDN found', () => {
    vi.mocked(jwtDecode).mockReturnValue({});

    const msisdn = getMSISDNFromToken('valid-token');

    expect(msisdn).toBeNull();
  });

  it('returns null for no token', () => {
    const msisdn = getMSISDNFromToken();

    expect(msisdn).toBeNull();
    expect(jwtDecode).not.toHaveBeenCalled();
  });
});

describe('generateRequestHash', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates hash from transaction ID and URL', () => {
    const hash = generateRequestHash('TX123', '/api/endpoint?param=value');

    expect(hash).toBe('mock-hash-value');
    expect(sha224).toHaveBeenCalledWith('TX123secret-key/api/endpoint1.0.0');
  });

  it('strips query parameters from URL', () => {
    generateRequestHash('TX123', '/path?query=string');

    expect(sha224).toHaveBeenCalledWith(expect.stringContaining('/path'));
  });

  it('uses correct app version', () => {
    generateRequestHash('TX123', '/path');

    expect(sha224).toHaveBeenCalledWith(
      expect.stringContaining(config.appVersion)
    );
  });

  it('uses correct hash key', () => {
    generateRequestHash('TX123', '/path');

    expect(sha224).toHaveBeenCalledWith(
      expect.stringContaining(config.encrypt.hashKey)
    );
  });
});
