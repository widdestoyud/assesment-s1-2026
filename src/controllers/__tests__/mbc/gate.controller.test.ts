import { describe, expect, it, vi } from 'vitest';
import { useState, useEffect } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import type { CheckInUseCaseInterface } from '@core/use_case/mbc/CheckIn';

import GateController from '../../mbc/gate.controller';

function createMocks() {
  const checkInUseCase: CheckInUseCaseInterface = {
    execute: vi.fn().mockResolvedValue({
      checkInTime: '2024-01-01T10:00:00.000Z',
    }),
  };

  const nfcService = {
    isAvailable: vi.fn().mockReturnValue(true),
    requestPermission: vi.fn(),
    readCard: vi.fn(),
    writeCard: vi.fn(),
    writeAndVerify: vi.fn(),
    readThenWrite: vi.fn(),
  };

  return { checkInUseCase, nfcService };
}

function createController(mocks = createMocks()) {
  return renderHook(() =>
    GateController({
      useState,
      useEffect,
      useTranslation,
      images: { nfcLoadDataFailed: '/mock/nfc-error.svg' },
      ...mocks,
    }),
  );
}

describe('GateController', () => {
  it('starts in idle state', () => {
    const { result } = createController();

    expect(result.current.nfcStatus).toBe('idle');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.lastResult).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('detects NFC capability on mount', () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    expect(result.current.nfcCapability).toBe('supported');
    expect(mocks.nfcService.isAvailable).toHaveBeenCalled();
  });

  it('sets nfcCapability to unsupported when NFC not available', () => {
    const mocks = createMocks();
    mocks.nfcService.isAvailable = vi.fn().mockReturnValue(false);
    const { result } = createController(mocks);

    expect(result.current.nfcCapability).toBe('unsupported');
  });

  it('performs check-in successfully', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckIn();
    });

    expect(result.current.nfcStatus).toBe('success');
    expect(result.current.lastResult?.checkInTime).toBe('2024-01-01T10:00:00.000Z');
    expect(result.current.isProcessing).toBe(false);
  });

  it('handles check-in error', async () => {
    const mocks = createMocks();
    (mocks.checkInUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('mbc_error_already_checked_in'),
    );
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckIn();
    });

    expect(result.current.nfcStatus).toBe('error');
    expect(result.current.error).toContain('mbc_error_already_checked_in');
    expect(result.current.isProcessing).toBe(false);
  });

  it('exposes t function from useTranslation', () => {
    const { result } = createController();

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });
});
