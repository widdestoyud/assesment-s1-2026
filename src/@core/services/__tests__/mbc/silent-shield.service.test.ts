import fc from 'fast-check';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AwilixRegistry } from '@di/container';

import { SilentShieldService } from '../../mbc/silent-shield.service';

const mockContainer: AwilixRegistry = {} as any;

describe('SilentShieldService', () => {
  let service: ReturnType<typeof SilentShieldService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = SilentShieldService(mockContainer);
  });

  /**
   * **Validates: Requirements 11.4**
   *
   * Property 2: Encryption Round-Trip
   * For all valid byte arrays, decrypt(encrypt(data)) equals data
   */
  describe('Property 2: Encryption Round-Trip', () => {
    it(
      'decrypt(encrypt(data)) ≡ data for all valid byte arrays',
      () => {
        fc.assert(
          fc.property(
            fc.uint8Array({ minLength: 1, maxLength: 128 }),
            data => {
              const encrypted = service.encrypt(data);
              const decrypted = service.decrypt(encrypted);
              expect(new Uint8Array(decrypted)).toEqual(new Uint8Array(data));
            },
          ),
          { numRuns: 5 },
        );
      },
      30000,
    );
  });
});
