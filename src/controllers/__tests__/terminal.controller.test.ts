import { describe, expect, it, vi } from 'vitest';
import { useState, useEffect, useCallback } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';

import type { CheckOutUseCaseInterface } from '@core/use_case/mbc/CheckOut';
import type { ManualCalculationUseCaseInterface } from '@core/use_case/mbc/ManualCalculation';
import type { ManageServiceRegistryUseCaseInterface } from '@core/use_case/mbc/ManageServiceRegistry';
import type { DeviceServiceInterface } from '@core/services/mbc/device.service';

import { DEFAULT_PARKING_SERVICE } from '@core/services/mbc/models';
import TerminalController from '../terminal.controller';

const MOCK_DEVICE_ID = 'device-test-456';

const mockNfcService = {
  isAvailable: () => true,
  requestPermission: vi.fn(),
  readCard: vi.fn(),
  writeCard: vi.fn(),
  writeAndVerify: vi.fn(),
};

function createMocks() {
  const checkOutUseCase: CheckOutUseCaseInterface = {
    execute: vi.fn().mockResolvedValue({
      serviceTypeName: 'Parkir',
      entryTime: '2024-01-01T10:00:00.000Z',
      exitTime: '2024-01-01T13:00:00.000Z',
      duration: '3 jam',
      fee: 6000,
      remainingBalance: 44000,
      feeBreakdown: {
        fee: 6000,
        usageUnits: 3,
        unitLabel: 'jam',
        ratePerUnit: 2000,
        roundingApplied: 'ceiling',
      },
    }),
  };

  const manualCalculationUseCase: ManualCalculationUseCaseInterface = {
    execute: vi.fn().mockResolvedValue({
      fee: 4000,
      usageUnits: 2,
      unitLabel: 'jam',
      ratePerUnit: 2000,
      roundingApplied: 'ceiling',
    }),
  };

  const manageServiceRegistryUseCase: ManageServiceRegistryUseCaseInterface = {
    getAll: vi.fn().mockResolvedValue([DEFAULT_PARKING_SERVICE]),
    add: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    initializeDefaults: vi.fn().mockResolvedValue(undefined),
  };

  const deviceService: DeviceServiceInterface = {
    getDeviceId: vi.fn().mockResolvedValue(MOCK_DEVICE_ID),
    ensureDeviceId: vi.fn().mockResolvedValue({
      deviceId: MOCK_DEVICE_ID,
      wasRegenerated: false,
    }),
  };

  return { checkOutUseCase, manualCalculationUseCase, manageServiceRegistryUseCase, deviceService };
}

function createController(mocks = createMocks()) {
  return renderHook(() =>
    TerminalController({
      useState,
      useEffect,
      useCallback,
      ...mocks,
      nfcService: mockNfcService,
    }),
  );
}

describe('TerminalController', () => {
  it('starts in idle state', () => {
    const { result } = createController();

    expect(result.current.nfcStatus).toBe('idle');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.isManualMode).toBe(false);
    expect(result.current.lastResult).toBeNull();
    expect(result.current.manualResult).toBeNull();
  });

  it('performs check-out successfully', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await waitFor(() => {
      expect(result.current.serviceTypes).toHaveLength(1);
    });

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.nfcStatus).toBe('success');
    expect(result.current.lastResult?.fee).toBe(6000);
    expect(result.current.lastResult?.remainingBalance).toBe(44000);
  });

  it('handles check-out error', async () => {
    const mocks = createMocks();
    (mocks.checkOutUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Device mismatch'),
    );
    const { result } = createController(mocks);

    await waitFor(() => {
      expect(result.current.serviceTypes).toHaveLength(1);
    });

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.nfcStatus).toBe('error');
    expect(result.current.error).toContain('Device mismatch');
  });

  it('toggles manual mode', () => {
    const { result } = createController();

    act(() => {
      result.current.onToggleManualMode();
    });
    expect(result.current.isManualMode).toBe(true);

    act(() => {
      result.current.onToggleManualMode();
    });
    expect(result.current.isManualMode).toBe(false);
  });

  it('performs manual calculation', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onManualCalculate({
        checkInTimestamp: '2024-01-01T10:00:00.000Z',
        serviceTypeId: 'parking',
      });
    });

    expect(result.current.manualResult?.fee).toBe(4000);
    expect(mocks.manualCalculationUseCase.execute).toHaveBeenCalledOnce();
  });

  it('handles manual calculation error', async () => {
    const mocks = createMocks();
    (mocks.manualCalculationUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Service type not found'),
    );
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onManualCalculate({
        checkInTimestamp: '2024-01-01T10:00:00.000Z',
        serviceTypeId: 'nonexistent',
      });
    });

    expect(result.current.error).toContain('Service type not found');
    expect(result.current.manualResult).toBeNull();
  });

  it('clears manual result when toggling mode off', () => {
    const { result } = createController();

    act(() => {
      result.current.onToggleManualMode();
    });
    expect(result.current.isManualMode).toBe(true);

    act(() => {
      result.current.onToggleManualMode();
    });
    expect(result.current.isManualMode).toBe(false);
    expect(result.current.manualResult).toBeNull();
  });
});
