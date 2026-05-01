import { describe, expect, it, vi } from 'vitest';
import { useState, useEffect, useCallback } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';

import type { CheckInUseCaseInterface } from '@core/use_case/mbc/CheckIn';
import type { ManageServiceRegistryUseCaseInterface } from '@core/use_case/mbc/ManageServiceRegistry';
import type { DeviceServiceInterface } from '@core/services/mbc/device.service';

import { DEFAULT_PARKING_SERVICE } from '@core/services/mbc/models';
import GateController from '../gate.controller';

const MOCK_DEVICE_ID = 'device-test-123';

const mockNfcService = {
  isAvailable: () => true,
  requestPermission: vi.fn(),
  readCard: vi.fn(),
  writeCard: vi.fn(),
  writeAndVerify: vi.fn(),
};

function createMocks() {
  const checkInUseCase: CheckInUseCaseInterface = {
    execute: vi.fn().mockResolvedValue({
      memberName: 'John Doe',
      entryTime: '2024-01-01T10:00:00.000Z',
      serviceTypeName: 'Parkir',
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

  return { checkInUseCase, manageServiceRegistryUseCase, deviceService };
}

function createController(mocks = createMocks()) {
  return renderHook(() =>
    GateController({
      useState,
      useEffect,
      useCallback,
      ...mocks,
      nfcService: mockNfcService,
    }),
  );
}

describe('GateController', () => {
  it('starts in idle state', () => {
    const { result } = createController();

    expect(result.current.nfcStatus).toBe('idle');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.simulationMode).toBe(false);
    expect(result.current.lastResult).toBeNull();
  });

  it('ensures device ID on mount', async () => {
    const mocks = createMocks();
    createController(mocks);

    await waitFor(() => {
      expect(mocks.deviceService.ensureDeviceId).toHaveBeenCalledOnce();
    });
  });

  it('auto-selects service type when only one exists', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await waitFor(() => {
      expect(result.current.selectedServiceType).toEqual(DEFAULT_PARKING_SERVICE);
    });
  });

  it('toggles simulation mode', () => {
    const { result } = createController();

    act(() => {
      result.current.onToggleSimulation();
    });
    expect(result.current.simulationMode).toBe(true);

    act(() => {
      result.current.onToggleSimulation();
    });
    expect(result.current.simulationMode).toBe(false);
  });

  it('performs check-in successfully', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    // Wait for init
    await waitFor(() => {
      expect(result.current.deviceId).toBe(MOCK_DEVICE_ID);
      expect(result.current.selectedServiceType).not.toBeNull();
    });

    await act(async () => {
      await result.current.onCheckIn();
    });

    expect(result.current.nfcStatus).toBe('success');
    expect(result.current.lastResult?.memberName).toBe('John Doe');
  });

  it('handles check-in error', async () => {
    const mocks = createMocks();
    (mocks.checkInUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Already checked in'),
    );
    const { result } = createController(mocks);

    await waitFor(() => {
      expect(result.current.deviceId).toBe(MOCK_DEVICE_ID);
    });

    await act(async () => {
      await result.current.onCheckIn();
    });

    expect(result.current.nfcStatus).toBe('error');
    expect(result.current.error).toContain('Already checked in');
  });
});
