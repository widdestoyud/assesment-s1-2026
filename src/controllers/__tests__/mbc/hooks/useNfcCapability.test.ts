import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

import type { ChipTransferServiceInterface } from '@core/services/mbc/nfc.service';

import { useChipTransferCapability } from '../../../mbc/hooks/useNfcCapability';

function createMockService(overrides?: Partial<ChipTransferServiceInterface>): ChipTransferServiceInterface {
  return {
    isAvailable: vi.fn().mockReturnValue(true),
    queryPermission: vi.fn().mockResolvedValue('supported'),
    readCard: vi.fn(),
    readThenWrite: vi.fn(),
    ...overrides,
  };
}

describe('useChipTransferCapability', () => {
  it('returns supported when NFC is available and permission granted', async () => {
    const service = createMockService();
    const { result } = renderHook(() => useChipTransferCapability({ chipTransferService: service }));

    await waitFor(() => {
      expect(result.current.chipTransferCapability).toBe('supported');
    });
    expect(result.current.chipTransferAvailable).toBe(true);
  });

  it('returns unsupported when NFC hardware is not available', () => {
    const service = createMockService({ isAvailable: vi.fn().mockReturnValue(false) });
    const { result } = renderHook(() => useChipTransferCapability({ chipTransferService: service }));

    expect(result.current.chipTransferCapability).toBe('unsupported');
    expect(result.current.chipTransferAvailable).toBe(false);
  });

  it('falls back to permission_pending when queryPermission rejects', async () => {
    const service = createMockService({
      queryPermission: vi.fn().mockRejectedValue(new Error('Permission query failed')),
    });
    const { result } = renderHook(() => useChipTransferCapability({ chipTransferService: service }));

    await waitFor(() => {
      expect(result.current.chipTransferCapability).toBe('permission_pending');
    });
    expect(result.current.chipTransferAvailable).toBe(true);
  });

  it('chipTransferAvailable is true for permission_pending', async () => {
    const service = createMockService({
      queryPermission: vi.fn().mockResolvedValue('permission_pending'),
    });
    const { result } = renderHook(() => useChipTransferCapability({ chipTransferService: service }));

    await waitFor(() => {
      expect(result.current.chipTransferCapability).toBe('permission_pending');
    });
    expect(result.current.chipTransferAvailable).toBe(true);
  });

  it('chipTransferAvailable is false for permission_denied', async () => {
    const service = createMockService({
      queryPermission: vi.fn().mockResolvedValue('permission_denied'),
    });
    const { result } = renderHook(() => useChipTransferCapability({ chipTransferService: service }));

    await waitFor(() => {
      expect(result.current.chipTransferCapability).toBe('permission_denied');
    });
    expect(result.current.chipTransferAvailable).toBe(false);
  });

  it('calls onChange callback when passed to queryPermission', async () => {
    const onChangeFn = vi.fn();
    const service = createMockService({
      queryPermission: vi.fn().mockImplementation((onChange) => {
        if (onChange) onChange('supported');
        return Promise.resolve('supported');
      }),
    });

    const { result } = renderHook(() => useChipTransferCapability({ chipTransferService: service }));

    await waitFor(() => {
      expect(result.current.chipTransferCapability).toBe('supported');
    });
    expect(service.queryPermission).toHaveBeenCalled();
  });
});
