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
    serviceTypeId: string,
    deviceId: string,
    timestamp: string,
  ): CardData;
  applyCheckOut(
    card: CardData,
    fee: number,
    activityType: string,
    serviceTypeId: string,
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
      throw new Error('Failed to parse card data: invalid JSON');
    }

    const result = CardDataSchema.safeParse(parsed);
    if (!result.success) {
      const messages = result.error.issues
        .map(i => `${i.path.join('.')}: ${i.message}`)
        .join('; ');
      throw new Error(`Invalid card data: ${messages}`);
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
      serviceTypeId: 'top-up',
    };
    return {
      ...card,
      balance: newBalance,
      transactions: trimTransactions([...card.transactions, entry]),
    };
  };

  const applyCheckIn = (
    card: CardData,
    serviceTypeId: string,
    deviceId: string,
    timestamp: string,
  ): CardData => {
    if (card.checkIn !== null) {
      throw new Error(
        'Cannot check in: card already has an active check-in session',
      );
    }
    return {
      ...card,
      checkIn: {
        timestamp,
        serviceTypeId,
        deviceId,
      },
    };
  };

  const applyCheckOut = (
    card: CardData,
    fee: number,
    activityType: string,
    serviceTypeId: string,
    exitTimestamp: string,
  ): CardData => {
    if (card.checkIn === null) {
      throw new Error('Cannot check out: no active check-in session');
    }
    const newBalance = card.balance - fee;
    const entry: TransactionLogEntry = {
      amount: -fee,
      timestamp: exitTimestamp,
      activityType,
      serviceTypeId,
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
