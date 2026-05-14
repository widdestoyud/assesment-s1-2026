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
  isSimulation: boolean;
}

export interface CheckOutResult {
  fee: number;
  duration: string;
  checkInTime: string;
  checkOutTime: string;
  remainingBalance: number;
  feeBreakdown: FeeResult;
  isSimulation: boolean;
}

export interface OperationResult {
  type: 'new' | 'existing' | 'top-up';
  balance: number;
}

export type NfcCapabilityStatus =
  | 'supported'
  | 'unsupported'
  | 'permission_pending'
  | 'permission_denied';

export interface ResultModalProps {
  variant: 'success' | 'error';
  title: string;
  subtitle: string;
  buttonLabel: string;
  imageSrc?: string;
  detail?: { label: string; value: string };
  hideHeader?: boolean;
}
