import type { AwilixRegistry } from '@di/container';
import type { CardData } from '@core/services/mbc/models';

import { CardDataSchema } from '@core/services/mbc/models';

export interface CardDataServiceInterface {
  serialize(card: CardData): Uint8Array;
  deserialize(raw: Uint8Array): CardData;
  createBlank(): CardData;
  applyTopUp(card: CardData, amount: number): CardData;
  applyCheckIn(card: CardData, timestamp: string): CardData;
  applyCheckOut(card: CardData, fee: number): CardData;
}

export const CardDataService = (
  _deps: AwilixRegistry,
): CardDataServiceInterface => {
  const serialize = (card: CardData): Uint8Array => {
    const json = JSON.stringify(card);
    return new TextEncoder().encode(json);
  };

  const deserialize = (raw: Uint8Array): CardData => {
    const json = new TextDecoder().decode(raw);
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error('mbc_nfc_error_card_not_recognized');
    }

    const result = CardDataSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error('mbc_nfc_error_card_data_corrupted');
    }

    return result.data as CardData;
  };

  const createBlank = (): CardData => {
    return { v: 2, b: 0, s: 0, t: null };
  };

  const applyTopUp = (card: CardData, amount: number): CardData => {
    return { ...card, b: card.b + amount };
  };

  const applyCheckIn = (card: CardData, timestamp: string): CardData => {
    if (card.s !== 0) {
      throw new Error('mbc_error_already_checked_in');
    }
    return { ...card, s: 1, t: timestamp };
  };

  const applyCheckOut = (card: CardData, fee: number): CardData => {
    if (card.s !== 1) {
      throw new Error('mbc_error_not_checked_in');
    }
    return { ...card, s: 0, t: null, b: card.b - fee };
  };

  return {
    serialize,
    deserialize,
    createBlank,
    applyTopUp,
    applyCheckIn,
    applyCheckOut,
  };
};
