import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpResponse } from '@core/protocols/http';
import { AwilixRegistry } from '@di/container';
import type {
  EligibilityResponseInterface,
  MsisdnServiceInterface,
  OtpResponseInterface,
} from '../msisdn.service';

// Mock dependencies
const mockHttp = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

const mockContainer: AwilixRegistry = {
  http: mockHttp,
} as any;

const { MsisdnService } = await import('../msisdn.service');

describe('MsisdnService', () => {
  const testMsisdn = '628123456789';
  const testSignature = 'test-signature';
  const testPin = '123456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkEligibility', () => {
    it('calls correct API with proper payload', async () => {
      const service: MsisdnServiceInterface = MsisdnService(mockContainer);
      const mockResponse: HttpResponse<EligibilityResponseInterface> = {
        data: {
          msisdn: testMsisdn,
          signature: testSignature,
          eligibility: true,
        },
        status: '200',
        message: 'Success',
        transaction_id: 'TRX1234567890',
      };

      mockHttp.post.mockResolvedValue(mockResponse);

      const result = await service.checkEligibility(testMsisdn, true);

      expect(mockHttp.post).toHaveBeenCalledWith(
        'prepaid-registration/eligible',
        {
          msisdn: testMsisdn,
          esim: true,
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles different esim values', async () => {
      const service: MsisdnServiceInterface = MsisdnService(mockContainer);

      await service.checkEligibility(testMsisdn, false);

      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ esim: false })
      );
    });

    it('propagates errors', async () => {
      const service: MsisdnServiceInterface = MsisdnService(mockContainer);
      const testError = new Error('Network error');
      mockHttp.post.mockRejectedValue(testError);

      await expect(service.checkEligibility(testMsisdn, true)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('validateOtp', () => {
    it('calls correct API with proper payload', async () => {
      const service: MsisdnServiceInterface = MsisdnService(mockContainer);
      const mockResponse: HttpResponse<OtpResponseInterface> = {
        data: {
          valid: 'true',
          signature: testSignature,
        },
        status: '200',
        message: 'Success',
        transaction_id: 'TRX1234567890',
      };

      mockHttp.post.mockResolvedValue(mockResponse);

      const result = await service.validateOtp(
        testMsisdn,
        testPin,
        testSignature
      );

      expect(mockHttp.post).toHaveBeenCalledWith(
        'prepaid-registration/otp/validate',
        {
          msisdn: testMsisdn,
          pin: testPin,
          signature: testSignature,
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles different pin values', async () => {
      const service: MsisdnServiceInterface = MsisdnService(mockContainer);
      const newPin = '654321';

      await service.validateOtp(testMsisdn, newPin, testSignature);

      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ pin: newPin })
      );
    });

    it('propagates errors', async () => {
      const service: MsisdnServiceInterface = MsisdnService(mockContainer);
      const testError = new Error('OTP validation failed');
      mockHttp.post.mockRejectedValue(testError);

      await expect(
        service.validateOtp(testMsisdn, testPin, testSignature)
      ).rejects.toThrow('OTP validation failed');
    });

    it('handles various response types', async () => {
      const service: MsisdnServiceInterface = MsisdnService(mockContainer);

      // Test valid response
      mockHttp.post.mockResolvedValueOnce({
        data: { valid: 'true', signature: testSignature },
      });
      const validRes = await service.validateOtp(
        testMsisdn,
        testPin,
        testSignature
      );
      expect(validRes.data.valid).toBe('true');

      // Test invalid response
      mockHttp.post.mockResolvedValueOnce({
        data: { valid: 'false', signature: testSignature },
      });
      const invalidRes = await service.validateOtp(
        testMsisdn,
        'wrong-pin',
        testSignature
      );
      expect(invalidRes.data.valid).toBe('false');
    });
  });

  it('uses the same http instance for both methods', () => {
    const service: MsisdnServiceInterface = MsisdnService(mockContainer);

    service.checkEligibility(testMsisdn, true);
    service.validateOtp(testMsisdn, testPin, testSignature);

    expect(mockHttp.post).toHaveBeenCalledTimes(2);
    // Both calls should use the same mock http instance
    const firstCallInstance = mockHttp.post.mock.instances[0];
    const secondCallInstance = mockHttp.post.mock.instances[1];
    expect(firstCallInstance).toBe(secondCallInstance);
  });
});
