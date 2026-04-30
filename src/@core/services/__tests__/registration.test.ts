import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpResponse } from '@core/protocols/http';
import { RegistrationService } from '../registration.service';

describe('RegistrationService', () => {
  const mockHttp = {
    get: vi.fn(),
    post: vi.fn(),
  };

  const mockContainer = {
    http: mockHttp,
  };

  const service = RegistrationService(mockContainer as any);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkStatus', () => {
    it('should call http.post with correct parameters', async () => {
      const mockResponse: HttpResponse<CheckStatusResponseInterface> = {
        data: {
          nik: '1234567890',
          services: [
            {
              serviceType: 'MOBILE',
              msisdn: '08123456789',
            },
          ],
        },
        status: '200',
        message: 'Success',
        transaction_id: 'TRX1234567890',
      };

      mockHttp.post.mockResolvedValue(mockResponse);

      const nik = '1234567890';
      const nokk = '9876543210';
      const msisdn = '08123456789';

      const result = await service.checkStatus(nik, nokk, msisdn);

      expect(mockHttp.post).toHaveBeenCalledWith(
        'prepaid-registration/registration-detail',
        {
          msisdn,
          nik,
          nokk,
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('validateNik', () => {
    it('should call http.post with correct parameters', async () => {
      const mockResponse: HttpResponse<ValidateNikResponseInterface> = {
        data: {
          nik: '1234567890',
          nokk: '9876543210',
          misisdn: '08123456789',
          signature: 'signature123',
        },
        status: '200',
        message: 'Success',
        transaction_id: 'TRX1234567890',
      };

      mockHttp.post.mockResolvedValue(mockResponse);

      const nik = '1234567890';
      const nokk = '9876543210';
      const msisdn = '08123456789';
      const signature = 'signature123';

      const result = await service.validateNik(msisdn, nik, nokk, signature);

      expect(mockHttp.post).toHaveBeenCalledWith(
        'prepaid-registration/dukcapil',
        {
          msisdn,
          nik,
          nokk,
          signature,
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('registerPrepaid', () => {
    it('should call http.post with correct parameters', async () => {
      const mockResponse: HttpResponse<RegisterResponseInterface> = {
        data: {
          signature: 'new-signature-456',
        },
        status: '200',
        message: 'Success',
        transaction_id: 'TRX1234567890',
      };

      mockHttp.post.mockResolvedValue(mockResponse);

      const nik = '1234567890';
      const nokk = '9876543210';
      const msisdn = '08123456789';
      const signature = 'signature123';

      const result = await service.registerPrepaid(
        msisdn,
        nik,
        nokk,
        signature
      );

      expect(mockHttp.post).toHaveBeenCalledWith(
        'prepaid-registration/register',
        {
          msisdn,
          nik,
          nokk,
          signature,
        }
      );

      expect(result).toEqual(mockResponse);
    });
  });
});

// Re-declare interfaces needed for the test
interface CheckStatusResponseInterface {
  nik: string;
  services: StatusServicesResponse[];
}

interface StatusServicesResponse {
  serviceType: string;
  msisdn: string;
}

interface ValidateNikResponseInterface {
  nik: string;
  nokk: string;
  misisdn: string;
  signature: string;
}

interface RegisterResponseInterface {
  signature: string;
}
