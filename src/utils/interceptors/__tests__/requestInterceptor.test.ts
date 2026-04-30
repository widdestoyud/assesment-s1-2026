import type { InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { embedHeaderRequest } from '@utils/helpers/header.helper';
import { requestInterceptor } from '../requestInterceptor';

// Mock the embedHeaderRequest function
vi.mock('@utils/helpers/header.helper.ts', () => ({
  embedHeaderRequest: vi.fn(),
}));

describe('requestInterceptor', () => {
  const mockConfig: InternalAxiosRequestConfig = {
    url: '/api/test',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    headers: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    mockConfig.headers = {};
  });

  it('calls embedHeaderRequest with the config', async () => {
    await requestInterceptor(mockConfig);
    expect(embedHeaderRequest).toHaveBeenCalledWith(mockConfig);
  });

  it('returns the same config object', async () => {
    const result = await requestInterceptor(mockConfig);
    expect(result).toBe(mockConfig);
  });

  it('works with async embedHeaderRequest', async () => {
    // Simulate an async operation in embedHeaderRequest
    vi.mocked(embedHeaderRequest).mockImplementationOnce(async config => {
      await new Promise(resolve => setTimeout(resolve, 10));
      config.headers['Test'] = 'value';
    });

    const result = await requestInterceptor(mockConfig);

    expect(result.headers).toEqual({ Test: 'value' });
    expect(embedHeaderRequest).toHaveBeenCalled();
  });

  it('preserves existing headers', async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    mockConfig.headers = { Authorization: 'Bearer token' };

    // Simulate header modification
    vi.mocked(embedHeaderRequest).mockImplementationOnce(async config => {
      config.headers['New-Header'] = 'test';
    });

    const result = await requestInterceptor(mockConfig);

    expect(result.headers).toEqual({
      Authorization: 'Bearer token',
      'New-Header': 'test',
    });
  });

  it('handles errors from embedHeaderRequest', async () => {
    vi.mocked(embedHeaderRequest).mockRejectedValueOnce(
      new Error('Test error')
    );

    await expect(requestInterceptor(mockConfig)).rejects.toThrow('Test error');
  });
});
