export interface CardData {
  v: 2;
  b: number; // balance (0-999999)
  s: 0 | 1; // checkInStatus: 0=idle, 1=checked-in
  t: string | null; // checkInTimestamp ISO 8601 (null when s=0)
}
