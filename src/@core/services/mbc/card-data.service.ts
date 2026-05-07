import type { AwilixRegistry } from '@di/container';
import type { CardData, TransactionEntry } from '@core/services/mbc/models';

import { CardDataSchema } from '@core/services/mbc/models';

const MAX_HISTORY = 5;

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
  const addHistory = (card: CardData, entry: TransactionEntry): CardData => {
    const history = [entry, ...card.h].slice(0, MAX_HISTORY);
    return { ...card, h: history };
  };

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
    return { v: 2, b: 0, s: 0, t: null, h: [] };
  };

  const applyTopUp = (card: CardData, amount: number): CardData => {
    const updated = { ...card, b: card.b + amount };
    return addHistory(updated, {
      ts: Math.floor(Date.now() / 1000),
      a: amount,
      tp: 'tu',
    });
  };

  const applyCheckIn = (card: CardData, timestamp: string): CardData => {
    if (card.s !== 0) {
      throw new Error('mbc_error_already_checked_in');
    }
    const updated: CardData = { ...card, s: 1, t: timestamp };
    return addHistory(updated, {
      ts: Math.floor(new Date(timestamp).getTime() / 1000),
      a: 0,
      tp: 'ci',
    });
  };

  const applyCheckOut = (card: CardData, fee: number): CardData => {
    if (card.s !== 1) {
      throw new Error('mbc_error_not_checked_in');
    }
    const updated: CardData = { ...card, s: 0, t: null, b: card.b - fee };
    return addHistory(updated, {
      ts: Math.floor(Date.now() / 1000),
      a: -fee,
      tp: 'co',
    });
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
