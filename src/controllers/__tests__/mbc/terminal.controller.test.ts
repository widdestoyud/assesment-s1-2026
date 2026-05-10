import { describe, expect, it, vi } from 'vitest';
import { useState, useEffect } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import type { CheckOutUseCaseInterface } from '@core/use_case/mbc/CheckOut';

import TerminalController from '../../mbc/terminal.controller';

function createMocks() {
  const checkOutUseCase: CheckOutUseCaseInterface = {
    execute: vi.fn().mockResolvedValue({
      fee: 6000,
      duration: '3 jam',
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

  const nfcService = {
    isAvailable: vi.fn().mockReturnValue(true),
    requestPermission: vi.fn(),
    readCard: vi.fn(),
    writeCard: vi.fn(),
    writeAndVerify: vi.fn(),
    readThenWrite: vi.fn(),
  };

  return { checkOutUseCase, nfcService };
}

function createController(mocks = createMocks()) {
  return renderHook(() =>
    TerminalController({
      useState,
      useEffect,
      useTranslation,
      images: { nfcLoadDataFailed: '/mock/nfc-error.svg' },
      ...mocks,
    }),
  );
}

describe('TerminalController', () => {
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

  it('performs check-out successfully', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.nfcStatus).toBe('success');
    expect(result.current.lastResult?.fee).toBe(6000);
    expect(result.current.lastResult?.remainingBalance).toBe(44000);
    expect(result.current.isProcessing).toBe(false);
  });

  it('handles check-out error', async () => {
    const mocks = createMocks();
    (mocks.checkOutUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('mbc_error_not_checked_in'),
    );
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.nfcStatus).toBe('error');
    expect(result.current.error).toContain('mbc_error_not_checked_in');
    expect(result.current.isProcessing).toBe(false);
  });

  it('exposes t function from useTranslation', () => {
    const { result } = createController();

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });
});
