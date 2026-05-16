import { describe, expect, it, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import type { CardData } from '@core/models/mbc';
import type { ChipTransferServiceInterface } from '@core/services/mbc/nfc.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';

import { formatIDR, formatDuration } from '@utils/helpers/mbc.helper';

import ScoutController from '../../mbc/scout.controller';

const CARD_DATA: CardData = {
  v: 2,
  b: 25000,
  s: 0,
  t: null,
  h: [{ ts: 1704103200, a: 50000, tp: 'tu' }],
};

function createMocks() {
  const rawEncrypted = new Uint8Array([1, 2, 3, 4, 5]);
  const rawDecrypted = new TextEncoder().encode(JSON.stringify(CARD_DATA));

  const chipTransferService: ChipTransferServiceInterface = {
    isAvailable: vi.fn().mockReturnValue(true),
    queryPermission: vi.fn().mockResolvedValue('supported'),
    readCard: vi.fn().mockResolvedValue(rawEncrypted),
    readThenWrite: vi.fn(),
  };

  const silentShieldService: SilentShieldServiceInterface = {
    encrypt: vi.fn().mockResolvedValue(new Uint8Array([99])),
    decrypt: vi.fn().mockResolvedValue(rawDecrypted),
  };

  const cardDataService: CardDataServiceInterface = {
    serialize: vi.fn().mockReturnValue(new Uint8Array([10])),
    deserialize: vi.fn().mockReturnValue(CARD_DATA),
    createBlank: vi.fn().mockReturnValue({ v: 2, b: 0, s: 0, t: null, h: [] }),
    applyTopUp: vi.fn(),
    applyCheckIn: vi.fn(),
    applyCheckOut: vi.fn(),
  };

  // readCardUseCase removed — controller reads directly via services
  return { chipTransferService, silentShieldService, cardDataService };
}

function createController(mocks = createMocks()) {
  return renderHook(() =>
    ScoutController({
      useTranslation,
      useNavigate: () => vi.fn(),
      helpers: { formatIDR, formatDuration },
      images: {
        success: '/mock/success.svg',
        nfcLoadDataFailed: '/mock/nfc-load-data-failed.svg',
        tapNfc: '/mock/tap-nfc.svg',
        nfcFailed: '/mock/nfc-failed.svg',
      },
      ...mocks,
    }),
  );
}

describe('ScoutController', () => {
  it('starts in idle state with no card data', () => {
    const { result } = createController();

    expect(result.current.chipTransferStatus).toBe('idle');
    expect(result.current.isReading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.formattedBalance).toBe('');
  });

  it('detects NFC capability on mount', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await waitFor(() => {
      expect(result.current.chipTransferCapability).toBe('supported');
    });
    expect(mocks.chipTransferService.isAvailable).toHaveBeenCalled();
  });

  it('reads card successfully and exposes formatted data', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onReadCard();
    });

    expect(result.current.chipTransferStatus).toBe('success');
    expect(result.current.formattedBalance).toBe('Rp 25.000');
    expect(result.current.isReading).toBe(false);
    expect(result.current.resultType).toBe('read_success');
  });

  it('handles read error', async () => {
    const mocks = createMocks();
    (mocks.chipTransferService.readCard as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('NFC read failed'),
    );
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onReadCard();
    });

    expect(result.current.chipTransferStatus).toBe('error');
    expect(result.current.error).toContain('NFC read failed');
    expect(result.current.formattedBalance).toBe('');
  });

  it('exposes t function from useTranslation', () => {
    const { result } = createController();

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });
});
