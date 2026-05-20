import { describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import type { CheckInUseCaseInterface } from '@core/use_case/mbc/CheckIn';

import GateController from '../../mbc/gate.controller';

function createMocks() {
  const checkInUseCase: CheckInUseCaseInterface = {
    execute: vi.fn().mockResolvedValue({
      checkInTime: '2024-01-01T10:00:00.000Z',
    }),
  };

  const chipTransferService = {
    isAvailable: vi.fn().mockReturnValue(true),
    queryPermission: vi.fn().mockResolvedValue('supported'),
    readCard: vi.fn(),
    readThenWrite: vi.fn(),
  };

  return { checkInUseCase, chipTransferService };
}

function createController(mocks = createMocks()) {
  return renderHook(() =>
    GateController({
      useTranslation,
      useNavigate: () => vi.fn(),
      images: { nfcLoadDataFailed: '/mock/nfc-error.svg', nfcFailed: '/mock/nfc-failed.svg', tapNfc: '/mock/tap-nfc.svg', success: '/mock/success.svg' },
      ...mocks,
    }),
  );
}

describe('GateController', () => {
  it('starts in idle state', () => {
    const { result } = createController();

    expect(result.current.chipTransferStatus).toBe('idle');
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.resultType).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('detects NFC capability on mount', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await waitFor(() => {
      expect(result.current.chipTransferCapability).toBe('supported');
    });
    expect(mocks.chipTransferService.isAvailable).toHaveBeenCalled();
  });

  it('sets chipTransferCapability to unsupported when NFC not available', () => {
    const mocks = createMocks();
    mocks.chipTransferService.isAvailable = vi.fn().mockReturnValue(false);
    const { result } = createController(mocks);

    expect(result.current.chipTransferCapability).toBe('unsupported');
  });

  it('performs check-in successfully', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckIn();
    });

    expect(result.current.chipTransferStatus).toBe('success');
    expect(result.current.resultType).toBe('checkin_success');
    expect(result.current.resultProps).not.toBeNull();
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

    expect(result.current.chipTransferStatus).toBe('error');
    expect(result.current.error).toContain('mbc_error_already_checked_in');
    expect(result.current.isProcessing).toBe(false);
  });

  it('exposes t function from useTranslation', () => {
    const { result } = createController();

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });

  it('performs simulation check-in successfully', async () => {
    const mocks = createMocks();
    (mocks.checkInUseCase.execute as ReturnType<typeof vi.fn>).mockResolvedValue({
      checkInTime: '2024-01-01T07:00:00.000Z',
      isSimulation: true,
    });
    const { result } = createController(mocks);

    // Set simulation date/time to past
    act(() => {
      result.current.onSetSimulationDate('2024-01-01');
      result.current.onSetSimulationTime('07:00');
    });

    await act(async () => {
      await result.current.onSimulationCheckIn();
    });

    expect(result.current.chipTransferStatus).toBe('success');
    expect(result.current.resultType).toBe('checkin_success');
    expect(result.current.resultProps?.variant).toBe('success');
  });

  it('rejects simulation check-in with future timestamp', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    // Set simulation date/time to future
    const tomorrow = new Date(Date.now() + 86400000);
    act(() => {
      result.current.onSetSimulationDate(tomorrow.toISOString().split('T')[0]);
      result.current.onSetSimulationTime('23:59');
    });

    await act(async () => {
      await result.current.onSimulationCheckIn();
    });

    // Should set error without calling use case
    expect(result.current.error).toBeDefined();
    expect(mocks.checkInUseCase.execute).not.toHaveBeenCalled();
  });

  it('handles ChipTransferServiceError during check-in', async () => {
    const { ChipTransferServiceError } = await import('@core/services/mbc/nfc.service');
    const mocks = createMocks();
    (mocks.checkInUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
      new ChipTransferServiceError({
        type: 'hardware_unavailable',
        message: 'NFC unavailable',
        messageKey: 'mbc_nfc_error_hardware_unavailable',
      }),
    );
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckIn();
    });

    expect(result.current.resultType).toBe('nfc_error');
    expect(result.current.error).toBe('mbc_nfc_error_hardware_unavailable');
  });

  it('onSetActiveTab switches tab and clears state', () => {
    const { result } = createController();

    act(() => {
      result.current.onSetActiveTab('simulation');
    });

    expect(result.current.activeTab).toBe('simulation');
  });

  it('onCloseResult resets all result state', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckIn();
    });

    expect(result.current.resultType).toBe('checkin_success');

    act(() => {
      result.current.onCloseResult();
    });

    expect(result.current.resultType).toBeNull();
    expect(result.current.chipTransferStatus).toBe('idle');
    expect(result.current.error).toBeNull();
  });

  it('onBack calls window.history.back', () => {
    const historyBackSpy = vi.spyOn(window.history, 'back').mockImplementation(() => undefined);
    const { result } = createController();

    result.current.onBack();

    expect(historyBackSpy).toHaveBeenCalled();
    historyBackSpy.mockRestore();
  });

  it('onNfcNoticeClose navigates to home', () => {
    const mockNav = vi.fn();
    const { result } = renderHook(() =>
      GateController({
        useTranslation,
        useNavigate: () => mockNav,
        images: { nfcLoadDataFailed: '/mock/nfc-error.svg', nfcFailed: '/mock/nfc-failed.svg', tapNfc: '/mock/tap-nfc.svg', success: '/mock/success.svg' },
        ...createMocks(),
      }),
    );

    result.current.onNfcNoticeClose();

    expect(mockNav).toHaveBeenCalledWith({ to: '/' });
  });

  it('exposes maxDate as today', () => {
    const { result } = createController();
    const today = new Date().toISOString().split('T')[0];

    expect(result.current.maxDate).toBe(today);
  });

  it('resultProps shows already_checked_in error', async () => {
    const mocks = createMocks();
    (mocks.checkInUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('mbc_error_already_checked_in'),
    );
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onCheckIn();
    });

    expect(result.current.resultType).toBe('already_checked_in');
    expect(result.current.resultProps?.variant).toBe('error');
  });
});
