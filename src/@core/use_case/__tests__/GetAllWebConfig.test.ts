// getAllWebConfig.test.ts
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { AwilixRegistry } from '@di/container';
import { GetAllWebConfig, GetAllWebConfigInterface } from '../GetAllWebConfig';

// Mock implementations
const mockConfigService = {
  getWebUIConfig: vi.fn(),
  getAssets: vi.fn(),
};

const mockUseQueryTanstack = vi.fn();
const mockConfig = {
  encrypt: { key: 'secret-key' },
  appVersion: '1.0.0',
};

const mockDependencies: AwilixRegistry = {
  configService: mockConfigService,
  useQueryTanstack: mockUseQueryTanstack,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  config: mockConfig,
};

describe('GetAllWebConfig', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockUseQueryTanstack.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'web-config') {
        return { data: { config: true }, isPending: false };
      }
      if (queryKey[0] === 'web-assets') {
        return { data: { assets: [] }, isLoading: false };
      }
    });
  });

  test('constructs correct query parameter for web config', () => {
    const { useCase } = GetAllWebConfig(mockDependencies);
    useCase();

    const webConfigQuery = mockUseQueryTanstack.mock.calls.find(
      call => call[0].queryKey[0] === 'web-config'
    );
    const queryFn = webConfigQuery?.[0].queryFn;

    expect(queryFn).toBeDefined();
    // Verify queryFn logic
    const q = btoa(
      mockConfig.encrypt.key +
        JSON.stringify({ version: mockConfig.appVersion })
    );
    expect(mockConfigService.getWebUIConfig).not.toHaveBeenCalledWith(q);
    queryFn!(); // Execute the query function
    expect(mockConfigService.getWebUIConfig).toHaveBeenCalledWith(q);
  });

  test('returns correct loading state', () => {
    mockUseQueryTanstack.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'web-config') {
        return { isPending: true };
      }
      if (queryKey[0] === 'web-assets') {
        return { isLoading: true };
      }
      return {};
    });

    const { useCase } = GetAllWebConfig(mockDependencies);
    const result = useCase();

    expect(result.isLoading).toBe(true);
  });

  test('returns data correctly when queries succeed', () => {
    const mockData = {
      isLoading: false,
      webUIConfig: { setting: true },
      assets: { images: [] },
    };

    mockUseQueryTanstack.mockImplementation(({ queryKey }) => {
      if (queryKey[0] === 'web-config') {
        return { data: mockData.webUIConfig, isPending: false };
      }
      if (queryKey[0] === 'web-assets') {
        return { data: mockData.assets, isLoading: false };
      }
    });

    const { useCase } = GetAllWebConfig(mockDependencies);
    const result = useCase<GetAllWebConfigInterface>();

    expect(result).toEqual({
      isLoading: false,
      webUIConfig: mockData.webUIConfig,
      assets: mockData.assets,
    });
  });
});

// Type augmentation for test context
declare global {
  function btoa(str: string): string;
}
global.btoa = str => Buffer.from(str).toString('base64');
