import { describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';

import type { ValidateCardUseCaseInterface } from '@core/use_case/mbc/ValidateCard';
import type { ChipTransferServiceInterface } from '@core/services/mbc/nfc.service';
import { ChipTransferServiceError } from '@core/services/mbc/nfc.service';

import StationController from '../../mbc/station.controller';

const mockNavigate = vi.fn();

interface TopUpBalanceUseCaseInterface {
  execute(params: { amount: number }): Promise<void>;
}

function createMocks() {
  const validateCardUseCase: ValidateCardUseCaseInterface = {
    execute: vi.fn().mockResolvedValue({ type: 'existing', balance: 25000 }),
  };

  const topUpBalanceUseCase: TopUpBalanceUseCaseInterface = {
    execute: vi.fn().mockResolvedValue(undefined),
  };

  const chipTransferService: ChipTransferServiceInterface = {
    isAvailable: vi.fn().mockReturnValue(true),
    queryPermission: vi.fn().mockResolvedValue('supported'),
    readCard: vi.fn(),
    readThenWrite: vi.fn(),
  };

  return { validateCardUseCase, topUpBalanceUseCase, chipTransferService };
}

function createController(mocks = createMocks()) {
  return renderHook(() =>
    StationController({
      useTranslation,
      useNavigate: () => mockNavigate,
      useForm,
      images: {
        success: '/mock/success.svg',
        nfcLoadDataFailed: '/mock/nfc-error.svg',
        nfcFailed: '/mock/nfc-failed.svg',
        tapNfc: '/mock/tap-nfc.svg',
        nfcSuccessHuman: '/mock/nfc-success.svg',
      },
      ...mocks,
    }),
  );
}

describe('StationController', () => {
  it('starts in home phase with idle state', () => {
    const { result } = createController();

    expect(result.current.phase).toBe('home');
    expect(result.current.chipTransferStatus).toBe('idle');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.resultType).toBeNull();
    expect(result.current.cardData).toBeNull();
  });

  it('detects NFC capability on mount', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await waitFor(() => {
      expect(result.current.chipTransferCapability).toBe('supported');
    });
    expect(result.current.chipTransferAvailable).toBe(true);
  });

  it('exposes t function and pageTitle', () => {
    const { result } = createController();

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.pageTitle).toBe('string');
  });

  describe('onRegister', () => {
    it('registers new card successfully', async () => {
      const mocks = createMocks();
      (mocks.validateCardUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ type: 'new', balance: 0 });
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onRegister();
      });

      expect(result.current.resultType).toBe('register_success');
      expect(result.current.chipTransferStatus).toBe('success');
    });

    it('detects already registered card', async () => {
      const mocks = createMocks();
      (mocks.validateCardUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ type: 'existing', balance: 25000 });
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onRegister();
      });

      expect(result.current.resultType).toBe('already_registered');
      expect(result.current.cardData).not.toBeNull();
      expect(result.current.cardData?.b).toBe(25000);
    });

    it('handles NFC error during registration', async () => {
      const mocks = createMocks();
      (mocks.validateCardUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
        new ChipTransferServiceError({
          type: 'hardware_unavailable',
          message: 'NFC unavailable',
          messageKey: 'mbc_nfc_error_hardware_unavailable',
        }),
      );
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onRegister();
      });

      expect(result.current.resultType).toBe('nfc_error');
      expect(result.current.chipTransferStatus).toBe('error');
    });

    it('handles generic error during registration', async () => {
      const mocks = createMocks();
      (mocks.validateCardUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Unknown error'),
      );
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onRegister();
      });

      expect(result.current.chipTransferStatus).toBe('error');
      expect(result.current.error).toBe('Unknown error');
    });
  });

  describe('onStartTopUp', () => {
    it('transitions to topup phase when card is registered', async () => {
      const mocks = createMocks();
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onStartTopUp();
      });

      expect(result.current.phase).toBe('topup');
      expect(result.current.cardData?.b).toBe(25000);
    });

    it('shows not_registered when card is new', async () => {
      const mocks = createMocks();
      (mocks.validateCardUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ type: 'new', balance: 0 });
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onStartTopUp();
      });

      expect(result.current.resultType).toBe('not_registered');
      expect(result.current.phase).toBe('home');
    });

    it('handles NFC error during start top-up', async () => {
      const mocks = createMocks();
      (mocks.validateCardUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
        new ChipTransferServiceError({
          type: 'read_failed',
          message: 'Read failed',
          messageKey: 'mbc_nfc_error_read_failed',
        }),
      );
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onStartTopUp();
      });

      expect(result.current.resultType).toBe('nfc_error');
    });
  });

  describe('onTopUpNow', () => {
    it('performs top-up successfully', async () => {
      const mocks = createMocks();
      const { result } = createController(mocks);

      // First, start top-up to get to topup phase
      await act(async () => {
        await result.current.onStartTopUp();
      });

      // Select a chip amount
      act(() => {
        result.current.onSelectChip(10000);
      });

      await act(async () => {
        await result.current.onTopUpNow();
      });

      expect(result.current.resultType).toBe('topup_success');
      expect(result.current.chipTransferStatus).toBe('success');
    });

    it('handles NFC error during top-up', async () => {
      const mocks = createMocks();
      (mocks.topUpBalanceUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
        new ChipTransferServiceError({
          type: 'write_failed',
          message: 'Write failed',
          messageKey: 'mbc_nfc_error_write_failed',
        }),
      );
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onStartTopUp();
      });

      act(() => {
        result.current.onSelectChip(5000);
      });

      await act(async () => {
        await result.current.onTopUpNow();
      });

      expect(result.current.resultType).toBe('nfc_error');
    });

    it('handles generic error during top-up', async () => {
      const mocks = createMocks();
      (mocks.topUpBalanceUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Top-up failed'),
      );
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onStartTopUp();
      });

      act(() => {
        result.current.onSelectChip(5000);
      });

      await act(async () => {
        await result.current.onTopUpNow();
      });

      expect(result.current.resultType).toBe('topup_error');
      expect(result.current.error).toBe('Top-up failed');
    });

    it('does nothing when amount is 0 or invalid', async () => {
      const mocks = createMocks();
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onStartTopUp();
      });

      // Don't select any amount — form amount is empty
      await act(async () => {
        await result.current.onTopUpNow();
      });

      // Should not have called execute
      expect(mocks.topUpBalanceUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('form state', () => {
    it('onSelectChip sets the amount and selectedChip', async () => {
      const mocks = createMocks();
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onStartTopUp();
      });

      act(() => {
        result.current.onSelectChip(20000);
      });

      expect(result.current.selectedChip).toBe(20000);
      expect(result.current.formattedTopUpAmount).toBe('20.000');
    });

    it('onCustomAmountChange clears selectedChip', async () => {
      const mocks = createMocks();
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onStartTopUp();
      });

      act(() => {
        result.current.onSelectChip(10000);
      });

      act(() => {
        result.current.onCustomAmountChange('15.000');
      });

      expect(result.current.selectedChip).toBeNull();
    });

    it('exposes quickAmounts array', () => {
      const { result } = createController();

      expect(result.current.quickAmounts).toEqual([2000, 5000, 10000, 20000, 50000, 100000]);
    });
  });

  describe('navigation and modal', () => {
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

    it('onCloseResult resets all state', async () => {
      const mocks = createMocks();
      (mocks.validateCardUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ type: 'new', balance: 0 });
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onRegister();
      });

      expect(result.current.resultType).toBe('register_success');

      act(() => {
        result.current.onCloseResult();
      });

      expect(result.current.resultType).toBeNull();
      expect(result.current.phase).toBe('home');
      expect(result.current.chipTransferStatus).toBe('idle');
      expect(result.current.error).toBeNull();
    });
  });

  describe('resultProps', () => {
    it('returns success props for register_success', async () => {
      const mocks = createMocks();
      (mocks.validateCardUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ type: 'new', balance: 0 });
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onRegister();
      });

      expect(result.current.resultProps?.variant).toBe('success');
    });

    it('returns success props for already_registered with balance detail', async () => {
      const mocks = createMocks();
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onRegister();
      });

      expect(result.current.resultProps?.variant).toBe('success');
      expect(result.current.resultProps?.detail).toBeDefined();
    });

    it('returns error props for not_registered', async () => {
      const mocks = createMocks();
      (mocks.validateCardUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue({ type: 'new', balance: 0 });
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onStartTopUp();
      });

      expect(result.current.resultProps?.variant).toBe('error');
    });

    it('returns null when no result', () => {
      const { result } = createController();

      expect(result.current.resultProps).toBeNull();
    });
  });

  describe('computed values', () => {
    it('formattedBalance is empty when no card data', () => {
      const { result } = createController();

      expect(result.current.formattedBalance).toBe('');
    });

    it('formattedBalance shows formatted amount when card data exists', async () => {
      const mocks = createMocks();
      const { result } = createController(mocks);

      await act(async () => {
        await result.current.onStartTopUp();
      });

      expect(result.current.formattedBalance).toBe('Rp 25.000');
    });
  });
});
