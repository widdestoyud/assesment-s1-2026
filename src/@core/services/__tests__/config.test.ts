import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpResponse } from '@core/protocols/http';
import type { AwilixRegistry } from '@di/container.ts';
import type {
  ConfigServiceInterface,
  WcmsDataInterface,
  WebUIData,
} from '../config.service';

// Mock dependencies
const mockHttp = {
  post: vi.fn(),
  get: vi.fn(),
};

const mockConfig = {
  api: {
    wcmsUrl: 'https://wcms-api.example.com',
  },
};

const mockContainer: AwilixRegistry = {
  http: mockHttp,
  config: mockConfig,
} as any;

const { ConfigService } = await import('../config.service');

describe('ConfigService', () => {
  const testQuery = 'test-query';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWebUIConfig', () => {
    it('calls correct API with proper payload', async () => {
      const service: ConfigServiceInterface = ConfigService(mockContainer);
      const mockResponse: HttpResponse<WebUIData> = {
        data: {
          isUsingRemoteConfig: true,
          isUsingAuth0: false,
          banner: { enabled: true, closeTimeout: 5000 },
        } as WebUIData,
        status: '200',
        message: 'Success',
        transaction_id: 'TRX1234567890',
      };

      mockHttp.post.mockResolvedValue(mockResponse);

      const result = await service.getWebUIConfig(testQuery);

      expect(mockHttp.post).toHaveBeenCalledWith('web-ui-config/', {
        q: testQuery,
      });

      expect(result).toEqual(mockResponse);
    });

    it('handles different query parameters', async () => {
      const service: ConfigServiceInterface = ConfigService(mockContainer);
      const newQuery = 'new-query';

      await service.getWebUIConfig(newQuery);

      expect(mockHttp.post).toHaveBeenCalledWith(expect.any(String), {
        q: newQuery,
      });
    });

    it('propagates errors', async () => {
      const service: ConfigServiceInterface = ConfigService(mockContainer);
      const testError = new Error('Network error');
      mockHttp.post.mockRejectedValue(testError);

      await expect(service.getWebUIConfig(testQuery)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getAssets', () => {
    it('calls correct API with proper configuration', async () => {
      const service: ConfigServiceInterface = ConfigService(mockContainer);
      const mockResponse: WcmsDataInterface = {
        asset1: 'value1',
        asset2: 'value2',
      } as WcmsDataInterface;

      mockHttp.get.mockResolvedValue(mockResponse);

      const result = await service.getAssets();

      expect(mockHttp.get).toHaveBeenCalledWith('v1/asset/web', {
        baseURL: mockConfig.api.wcmsUrl,
      });

      expect(result).toEqual(mockResponse);
    });

    it('uses correct base URL from config', async () => {
      const service: ConfigServiceInterface = ConfigService(mockContainer);

      await service.getAssets();

      expect(mockHttp.get).toHaveBeenCalledWith(expect.any(String), {
        baseURL: 'https://wcms-api.example.com',
      });
    });

    it('propagates errors', async () => {
      const service: ConfigServiceInterface = ConfigService(mockContainer);
      const testError = new Error('Assets error');
      mockHttp.get.mockRejectedValue(testError);

      await expect(service.getAssets()).rejects.toThrow('Assets error');
    });
  });

  it('uses the same http and config instances for all methods', () => {
    const service: ConfigServiceInterface = ConfigService(mockContainer);

    service.getWebUIConfig(testQuery);
    service.getAssets();

    // Verify all methods used the same http instance
    expect(mockHttp.post.mock.instances[0]).toBe(mockHttp);
    expect(mockHttp.get.mock.instances[0]).toBe(mockHttp);

    expect(mockHttp.get).toHaveBeenCalledWith(expect.any(String), {
      baseURL: mockConfig.api.wcmsUrl,
    });
  });
});
