/** Transaction type codes (compact for NFC storage) */
export type TransactionType = 'tu' | 'ci' | 'co';
// tu = top-up, ci = check-in, co = check-out

/** Single transaction history entry stored on card */
export interface TransactionEntry {
  ts: number;
  a: number;
  tp: TransactionType;
  sim?: 1;
}

export interface CardData {
  v: 2;
  b: number;
  s: 0 | 1; // checkInStatus: 0=idle, 1=checked-in
  t: string | null; // checkInTimestamp ISO 8601 (null when s=0)
  m?: 0 | 1; // simulationMode: 0 or undefined=normal, 1=simulation check-in
  h: TransactionEntry[]; // transaction history (max 5, newest first)
}
