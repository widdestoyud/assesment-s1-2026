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
    | 'connection_lost'
    | 'incompatible_card'
    | 'blank_card'
    | 'invalid_card_data'
    | 'corrupted_card_data';
  message: string;
  messageKey: string;
  messageParams?: Record<string, string | number>;
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
  checkInTime: string;
}

export interface CheckOutResult {
  fee: number;
  duration: string;
  remainingBalance: number;
  feeBreakdown: FeeResult;
}

export interface OperationResult {
  type: 'new' | 'existing' | 'top-up';
  balance: number;
}

export interface WriteVerifyResult {
  success: boolean;
  error?: string;
}

export type NfcCapabilityStatus =
  | 'supported'
  | 'unsupported'
  | 'permission_pending'
  | 'permission_denied';
