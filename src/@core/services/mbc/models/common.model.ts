import type { CardData } from './card-data.model.ts';

export type RoleMode = 'station' | 'gate' | 'terminal' | 'scout';

export type NfcStatus =
  | 'idle'
  | 'scanning'
  | 'reading'
  | 'writing'
  | 'verifying'
  | 'success'
  | 'error';

export interface NfcError {
  type:
    | 'permission_denied'
    | 'hardware_unavailable'
    | 'read_failed'
    | 'write_failed'
    | 'connection_lost';
  message: string;
}

export type NfcPermissionResult = 'granted' | 'denied' | 'unsupported';

export interface NfcScanSession {
  abort(): void;
}

export interface FeeResult {
  fee: number;
  usageUnits: number;
  unitLabel: string;
  ratePerUnit: number;
  roundingApplied: string;
}

export interface CheckInResult {
  memberName: string;
  entryTime: string;
  serviceTypeName: string;
}

export interface CheckOutResult {
  serviceTypeName: string;
  entryTime: string;
  exitTime: string;
  duration: string;
  fee: number;
  remainingBalance: number;
  feeBreakdown: FeeResult;
}

export interface OperationResult {
  type: 'registration' | 'top-up';
  memberName: string;
  previousBalance?: number;
  amount?: number;
  newBalance: number;
}

export interface AtomicWriteResult {
  success: boolean;
  before: CardData;
  after: CardData | null;
  error?: AtomicWriteError;
}

export type AtomicWriteError =
  | { type: 'read_failed'; message: string }
  | { type: 'validation_failed'; message: string }
  | { type: 'write_failed'; message: string }
  | { type: 'verification_failed'; message: string; rolledBack: boolean }
  | { type: 'rollback_failed'; message: string };

export interface WriteVerifyResult {
  success: boolean;
  error?: string;
}

export interface StorageError {
  type: 'unavailable' | 'quota_exceeded' | 'read_failed' | 'write_failed';
  message: string;
}

export type NfcCapabilityStatus =
  | 'supported'
  | 'unsupported'
  | 'permission_pending'
  | 'permission_denied';
