import type { AwilixRegistry } from '@di/container';
import type {
  CardData,
  MemberIdentity,
  TransactionLogEntry,
} from '@core/services/mbc/models';

import { CardDataSchema } from '@core/services/mbc/models';

export interface ValidationResult {
  success: boolean;
  errors?: string[];
}

export interface CardDataServiceInterface {
  serialize(card: CardData): Uint8Array;
  deserialize(raw: Uint8Array): CardData;
  validate(card: CardData): ValidationResult;
  applyRegistration(card: CardData, member: MemberIdentity): CardData;
  applyTopUp(card: CardData, amount: number): CardData;
  applyCheckIn(
    card: CardData,
    benefitTypeId: string,
    deviceId: string,
    timestamp: string,
  ): CardData;
  applyCheckOut(
    card: CardData,
    fee: number,
    activityType: string,
    benefitTypeId: string,
    exitTimestamp: string,
  ): CardData;
  appendTransactionLog(card: CardData, entry: TransactionLogEntry): CardData;
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

  const validate = (card: CardData): ValidationResult => {
    const result = CardDataSchema.safeParse(card);
    if (result.success) {
      return { success: true };
    }
    return {
      success: false,
      errors: result.error.issues.map(
        i => `${i.path.join('.')}: ${i.message}`,
      ),
    };
  };

  const applyRegistration = (
    card: CardData,
    member: MemberIdentity,
  ): CardData => {
    return {
      ...card,
      version: 1,
      member: { ...member },
      balance: 0,
      checkIn: null,
      transactions: [],
    };
  };

  const applyTopUp = (card: CardData, amount: number): CardData => {
    const newBalance = card.balance + amount;
    const entry: TransactionLogEntry = {
      amount,
      timestamp: new Date().toISOString(),
      activityType: 'top-up',
      benefitTypeId: 'top-up',
    };
    return {
      ...card,
      balance: newBalance,
      transactions: trimTransactions([...card.transactions, entry]),
    };
  };

  const applyCheckIn = (
    card: CardData,
    benefitTypeId: string,
    deviceId: string,
    timestamp: string,
  ): CardData => {
    if (card.checkIn !== null) {
      throw new Error('mbc_error_already_checked_in');
    }
    return {
      ...card,
      checkIn: {
        timestamp,
        benefitTypeId,
        deviceId,
      },
    };
  };

  const applyCheckOut = (
    card: CardData,
    fee: number,
    activityType: string,
    benefitTypeId: string,
    exitTimestamp: string,
  ): CardData => {
    if (card.checkIn === null) {
      throw new Error('mbc_error_not_checked_in');
    }
    const newBalance = card.balance - fee;
    const entry: TransactionLogEntry = {
      amount: -fee,
      timestamp: exitTimestamp,
      activityType,
      benefitTypeId,
    };
    return {
      ...card,
      balance: newBalance,
      checkIn: null,
      transactions: trimTransactions([...card.transactions, entry]),
    };
  };

  const appendTransactionLog = (
    card: CardData,
    entry: TransactionLogEntry,
  ): CardData => {
    return {
      ...card,
      transactions: trimTransactions([...card.transactions, entry]),
    };
  };

  const trimTransactions = (
    transactions: TransactionLogEntry[],
  ): TransactionLogEntry[] => {
    if (transactions.length > 5) {
      return transactions.slice(-5);
    }
    return transactions;
  };

  return {
    serialize,
    deserialize,
    validate,
    applyRegistration,
    applyTopUp,
    applyCheckIn,
    applyCheckOut,
    appendTransactionLog,
  };
};
