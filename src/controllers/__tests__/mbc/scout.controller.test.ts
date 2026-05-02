import { describe, expect, it, vi } from 'vitest';
import { useState, useEffect, useCallback } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';

import type { CardData } from '@core/services/mbc/models';
import type { ReadCardUseCaseInterface } from '@core/use_case/mbc/ReadCard';
import type { ManageBenefitRegistryUseCaseInterface } from '@core/use_case/mbc/ManageBenefitRegistry';

import { DEFAULT_PARKING_BENEFIT } from '@core/services/mbc/models';
import ScoutController from '../../mbc/scout.controller';

const CARD_DATA: CardData = {
  version: 1,
  member: { name: 'John Doe', memberId: 'M001' },
  balance: 25000,
  checkIn: null,
  transactions: [],
};

function createMocks() {
  const readCardUseCase: ReadCardUseCaseInterface = {
    execute: vi.fn().mockResolvedValue(CARD_DATA),
  };

  const manageBenefitRegistryUseCase: ManageBenefitRegistryUseCaseInterface = {
    getAll: vi.fn().mockResolvedValue([DEFAULT_PARKING_BENEFIT]),
    add: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    initializeDefaults: vi.fn().mockResolvedValue(undefined),
  };

  const nfcService = {
    isAvailable: () => true,
    requestPermission: vi.fn(),
    readCard: vi.fn(),
    writeCard: vi.fn(),
    writeAndVerify: vi.fn(),
  };

  return { readCardUseCase, manageBenefitRegistryUseCase, nfcService };
}

function createController(mocks = createMocks()) {
  return renderHook(() =>
    ScoutController({
      useState,
      useEffect,
      useCallback,
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
  });

  it('loads benefit types on mount', async () => {
    const mocks = createMocks();
    createController(mocks);

    await waitFor(() => {
      expect(mocks.manageBenefitRegistryUseCase.getAll).toHaveBeenCalledOnce();
    });
  });

  it('reads card successfully', async () => {
    const mocks = createMocks();
    const { result } = createController(mocks);

    await act(async () => {
      await result.current.onReadCard();
    });

    expect(result.current.nfcStatus).toBe('success');
    expect(result.current.cardData).toEqual(CARD_DATA);
    expect(result.current.isReading).toBe(false);
  });

  it('handles read error', async () => {
    const mocks = createMocks();
    (mocks.readCardUseCase.execute as ReturnType<typeof vi.fn>).mockRejectedValue(
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
});
