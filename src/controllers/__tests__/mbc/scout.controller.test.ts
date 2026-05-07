import { describe, expect, it, vi } from 'vitest';
import { useState, useEffect } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTranslation } from 'react-i18next';

import type { CardData } from '@core/services/mbc/models';
import type { NfcServiceInterface } from '@core/services/mbc/nfc.service';
import type { SilentShieldServiceInterface } from '@core/services/mbc/silent-shield.service';
import type { CardDataServiceInterface } from '@core/services/mbc/card-data.service';

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

  const nfcService: NfcServiceInterface = {
    isAvailable: vi.fn().mockReturnValue(true),
    requestPermission: vi.fn().mockResolvedValue('granted'),
    readCard: vi.fn().mockResolvedValue(rawEncrypted),
    writeCard: vi.fn().mockResolvedValue(undefined),
    writeAndVerify: vi.fn().mockResolvedValue({ success: true }),
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

  // readCardUseCase is still in deps (the controller has it in Pick but reads directly)
  const readCardUseCase = {
    execute: vi.fn().mockResolvedValue(CARD_DATA),
  };

  return { nfcService, silentShieldService, cardDataService, readCardUseCase };
}

function createController(mocks = createMocks()) {
  return renderHook(() =>
    ScoutController({
      useState,
      useEffect,
      useTranslation,
      ...mocks,
    }),
  );
}

describe('ScoutController', () => {
  it('starts in idle state with no card data', () => {
    const { result } = createController();

    expect(result.current.nfcStatus).toBe('idle');
    expect(result.current.cardData).toBeNull();
    expect(result.current.isReading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.rawEncryptedBase64).toBeNull();
    expect(result.current.rawDecryptedJson).toBeNull();
  });

  it('detects NFC capability on mount', () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    expect(result.current.nfcCapability).toBe('supported');
    expect(mocks.nfcService.isAvailable).toHaveBeenCalled();
  });

  it('reads card successfully and exposes raw data', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onReadCard();
    });

    expect(result.current.nfcStatus).toBe('success');
    expect(result.current.cardData).toEqual(CARD_DATA);
    expect(result.current.isReading).toBe(false);
    expect(result.current.rawEncryptedBase64).toBeDefined();
    expect(result.current.rawDecryptedJson).toBeDefined();
  });

  it('handles read error', async () => {
    const mocks = createMocks();
    (mocks.nfcService.readCard as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('NFC read failed'),
    );
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onReadCard();
    });

    expect(result.current.nfcStatus).toBe('error');
    expect(result.current.error).toContain('NFC read failed');
    expect(result.current.cardData).toBeNull();
  });

  it('exposes t function from useTranslation', () => {
    const { result } = createController();

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });
});
