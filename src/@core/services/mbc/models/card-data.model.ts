export interface CardData {
  version: number;
  member: MemberIdentity;
  balance: number;
  checkIn: CheckInStatus | null;
  transactions: TransactionLogEntry[];
}

export interface MemberIdentity {
  name: string;
  memberId: string;
}

export interface CheckInStatus {
  timestamp: string;
  benefitTypeId: string;
  deviceId: string;
}

export interface TransactionLogEntry {
  amount: number;
  timestamp: string;
  activityType: string;
  benefitTypeId: string;
}
