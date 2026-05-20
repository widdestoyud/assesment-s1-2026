import { describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import type { CheckOutUseCaseInterface } from '@core/use_case/mbc/CheckOut';

import TerminalController from '../../mbc/terminal.controller';

const mockNavigate = vi.fn();
const mockUseNavigate = vi.fn().mockReturnValue(mockNavigate);

function createMocks() {
  const checkOutUseCase: CheckOutUseCaseInterface = {
    execute: vi.fn().mockResolvedValue({
      fee: 6000,
      duration: '3 jam',
      checkInTime: '2024-01-01T10:00:00Z',
      checkOutTime: '2024-01-01T13:00:00Z',
      remainingBalance: 44000,
      isSimulation: false,
      feeBreakdown: {
        fee: 6000,
        usageUnits: 3,
        unitLabel: 'jam',
        ratePerUnit: 2000,
        roundingApplied: 'ceiling',
      },
    }),
  };

  const chipTransferService = {
    isAvailable: vi.fn().mockReturnValue(true),
    queryPermission: vi.fn().mockResolvedValue('supported'),
    readCard: vi.fn(),
    readThenWrite: vi.fn(),
  };

  return { checkOutUseCase, chipTransferService };
}

function createController(mocks = createMocks()) {
  return renderHook(() =>
    TerminalController({
      useTranslation,
      useNavigate: mockUseNavigate,
      images: {
        nfcLoadDataFailed: '/mock/nfc-error.svg',
        nfcFailed: '/mock/nfc-failed.svg',
        tapNfc: '/mock/tap-nfc.svg',
        success: '/mock/success.svg',
        nfcWarningHuman: '/mock/warning.svg',
      },
      ...mocks,
    }),
  );
}

describe('TerminalController', () => {
  it('starts in idle state', () => {
    const { result } = createController();

    expect(result.current.chipTransferStatus).toBe('idle');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.resultType).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.showNfcModal).toBe(false);
  });

  it('detects NFC capability on mount', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await waitFor(() => {
      expect(result.current.chipTransferCapability).toBe('supported');
    });
    expect(result.current.chipTransferAvailable).toBe(true);
    expect(mocks.chipTransferService.isAvailable).toHaveBeenCalled();
  });

  it('sets chipTransferCapability to unsupported when NFC not available', () => {
    const mocks = createMocks();
    mocks.chipTransferService.isAvailable = vi.fn().mockReturnValue(false);
    const { result } = createController(mocks);

    expect(result.current.chipTransferCapability).toBe('unsupported');
    expect(result.current.chipTransferAvailable).toBe(false);
  });

  it('performs check-out successfully', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.chipTransferStatus).toBe('success');
    expect(result.current.resultType).toBe('checkout_success');
    expect(result.current.checkOutSuccessDisplay?.totalFormatted).toBe('Rp 6.000');
    expect(result.current.checkOutSuccessDisplay?.remainingBalanceFormatted).toBe('Rp 44.000');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.showNfcModal).toBe(false);
    expect(result.current.resultType).toBe('checkout_success');
  });

  it('provides resultProps for checkout success', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.resultProps).not.toBeNull();
    expect(result.current.resultProps?.variant).toBe('success');
  });

  it('provides checkOutSuccessDisplay with formatted data', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.checkOutSuccessDisplay).not.toBeNull();
    expect(result.current.checkOutSuccessDisplay?.duration).toBe('3 jam');
    expect(result.current.checkOutSuccessDisplay?.totalFormatted).toBe('Rp 6.000');
    expect(result.current.checkOutSuccessDisplay?.rateFormatted).toBe('Rp 2.000');
    expect(result.current.checkOutSuccessDisplay?.remainingBalanceFormatted).toBe('Rp 44.000');
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

    expect(result.current.chipTransferStatus).toBe('error');
    expect(result.current.error).toContain('mbc_error_not_checked_in');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.showNfcModal).toBe(false);
    expect(result.current.resultType).toBe('not_checked_in');
  });

  it('exposes t function from useTranslation', () => {
    const { result } = createController();

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });

  it('exposes pageTitle', () => {
    const { result } = createController();

    expect(result.current.pageTitle).toBeDefined();
    expect(typeof result.current.pageTitle).toBe('string');
  });

  it('onBack calls window.history.back', () => {
    const historyBackSpy = vi.spyOn(window.history, 'back').mockImplementation(() => undefined);
    const { result } = createController();

    result.current.onBack();

    expect(historyBackSpy).toHaveBeenCalled();
    historyBackSpy.mockRestore();
  });

  it('onNfcNoticeClose navigates to home', () => {
    const { result } = createController();

    result.current.onNfcNoticeClose();

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
  });

  it('onCloseNfcModal cancels scan and hides modal', async () => {
    const mocks = createMocks();
    // Make execute hang so modal stays open
    (mocks.checkOutUseCase.execute as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}),
    );
    const { result } = createController(mocks);

    act(() => {
      result.current.onCheckOut();
    });

    act(() => {
      result.current.onCloseNfcModal();
    });

    expect(result.current.showNfcModal).toBe(false);
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.chipTransferStatus).toBe('idle');
  });

  it('onCloseResult resets all result state', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.resultType).toBe('checkout_success');

    act(() => {
      result.current.onCloseResult();
    });

    expect(result.current.resultType).toBeNull();
    expect(result.current.checkOutSuccessDisplay).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.chipTransferStatus).toBe('idle');
  });

  it('handles InsufficientBalanceError with display data', async () => {
    const { InsufficientBalanceError } = await import('@core/use_case/mbc/CheckOut');
    const mocks = createMocks();
    (mocks.checkOutUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
      new InsufficientBalanceError(
        '2024-01-01T10:00:00Z',
        '2024-01-01T13:00:00Z',
        '3 jam',
        { fee: 6000, usageUnits: 3, unitLabel: 'jam', ratePerUnit: 2000, roundingApplied: 'ceiling' },
        1000,
      ),
    );
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.resultType).toBe('insufficient_balance');
    expect(result.current.insufficientBalanceDisplay).not.toBeNull();
    expect(result.current.insufficientBalanceDisplay?.duration).toBe('3 jam');
    expect(result.current.insufficientBalanceDisplay?.totalFormatted).toBe('Rp 6.000');
    expect(result.current.insufficientBalanceDisplay?.balanceFormatted).toBe('Rp 1.000');
    expect(result.current.resultProps?.variant).toBe('error');
  });

  it('handles ChipTransferServiceError during checkout', async () => {
    const { ChipTransferServiceError } = await import('@core/services/mbc/nfc.service');
    const mocks = createMocks();
    (mocks.checkOutUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ChipTransferServiceError({
        type: 'connection_lost',
        message: 'Connection lost',
        messageKey: 'mbc_nfc_error_connection_lost',
      }),
    );
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.resultType).toBe('nfc_error');
    expect(result.current.error).toBe('mbc_nfc_error_connection_lost');
    expect(result.current.resultProps?.variant).toBe('error');
  });

  it('handles generic unknown error during checkout', async () => {
    const mocks = createMocks();
    (mocks.checkOutUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue('string error');
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.resultType).toBe('nfc_error');
    expect(result.current.error).toBe('string error');
  });

  it('shows simulation notice in checkout success display', async () => {
    const mocks = createMocks();
    (mocks.checkOutUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
      fee: 6000,
      duration: '3 jam',
      checkInTime: '2024-01-01T10:00:00Z',
      checkOutTime: '2024-01-01T13:00:00Z',
      remainingBalance: 50000,
      isSimulation: true,
      feeBreakdown: {
        fee: 6000,
        usageUnits: 3,
        unitLabel: 'jam',
        ratePerUnit: 2000,
        roundingApplied: 'ceiling',
      },
    });
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckOut();
    });

    expect(result.current.resultType).toBe('checkout_success');
    expect(result.current.checkOutSuccessDisplay?.isSimulation).toBe(true);
    expect(result.current.checkOutSuccessDisplay?.remainingBalanceFormatted).toBe('Rp 50.000');
  });

  it('onCancelScan resets processing state', () => {
    const { result } = createController();

    act(() => {
      result.current.onCancelScan();
    });

    expect(result.current.isProcessing).toBe(false);
    expect(result.current.chipTransferStatus).toBe('idle');
  });
});
