import { InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { embedHeaderRequest, generateParallelHeader } from '../header.helper';
import { generateRequestHash, generateTransactionId } from '../request.helper';

// Mock dependencies
vi.mock('../request.helper.ts', () => ({
  generateTransactionId: vi.fn(() => 'TX1234567890'),
  generateRequestHash: vi.fn(() => 'mock-hash-value'),
}));

vi.mock('@fingerprintjs/fingerprintjs', () => ({
  default: {
    load: vi.fn(() =>
      Promise.resolve({
        get: vi.fn(() => {
          return { visitorId: '2' };
        }),
      })
    ),
  },
}));

vi.mock('@src/infrastructure/config', () => ({
  default: {
    appVersion: '1.0.0',
    encrypt: {
      hashKey: 'test-hash-key',
    },
  },
}));

describe('embedHeaderRequest', () => {
  const mockConfig: InternalAxiosRequestConfig = {
    url: '/api/test',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    headers: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    mockConfig.headers = {};
  });

  it('adds all required headers when URL is present', () => {
    embedHeaderRequest(mockConfig);
    console.log(mockConfig);

    expect(mockConfig.headers).toEqual({
      HASH: 'mock-hash-value',
      TRANSACTIONID: 'TX1234567890',
      CHANNELID: 'WEB',
      authserver: '2',
      'mytelkomsel-web-app-version': '1.0.0',
      Accept: 'application/json',
      language: 'id',
    });

    expect(generateTransactionId).toHaveBeenCalled();
    expect(generateRequestHash).toHaveBeenCalledWith(
      'TX1234567890',
      '/api/test'
    );
  });

  it('merges with existing headers', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    mockConfig.headers = {
      Authorization: 'Bearer token',
      'Content-Type': 'application/json',
    };

    embedHeaderRequest(mockConfig);

    expect(mockConfig.headers).toMatchObject({
      Authorization: 'Bearer token',
      'Content-Type': 'application/json',
      HASH: 'mock-hash-value',
      TRANSACTIONID: 'TX1234567890',
    });
  });

  it('does nothing when URL is missing', () => {
    mockConfig.url = undefined;
    embedHeaderRequest(mockConfig);

    expect(mockConfig.headers).toEqual({});
    expect(generateTransactionId).not.toHaveBeenCalled();
    expect(generateRequestHash).not.toHaveBeenCalled();
  });

  it('handles URL with query parameters', () => {
    mockConfig.url = '/api/test?param=value';
    embedHeaderRequest(mockConfig);

    expect(generateRequestHash).toHaveBeenCalledWith(
      'TX1234567890',
      '/api/test?param=value'
    );
  });
});

describe('generateParallelHeader', () => {
  it('returns header with sprint identifier', () => {
    const result = generateParallelHeader('feature-sprint');
    expect(result).toEqual({
      'x-sprint-identifier': 'feature-sprint',
    });
  });

  it('handles empty parallel name', () => {
    const result = generateParallelHeader('');
    expect(result).toEqual({
      'x-sprint-identifier': '',
    });
  });

  it('handles special characters', () => {
    const result = generateParallelHeader('sprint@2024!');
    expect(result).toEqual({
      'x-sprint-identifier': 'sprint@2024!',
    });
  });
});
