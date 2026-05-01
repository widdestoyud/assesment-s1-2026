/**
 * Format a number as Indonesian Rupiah currency.
 * Example: formatIDR(2000) → "Rp 2.000"
 */
export const formatIDR = (amount: number): string => {
  const absStr = Math.abs(amount).toString();
  let formatted = '';
  let count = 0;
  for (let i = absStr.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      formatted = '.' + formatted;
    }
    formatted = absStr[i] + formatted;
    count++;
  }
  return amount < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
};

/**
 * Format the duration between two ISO 8601 timestamps as "X jam Y menit".
 * Example: formatDuration("2024-01-01T10:00:00Z", "2024-01-01T12:30:00Z") → "2 jam 30 menit"
 */
export const formatDuration = (
  checkInTime: string,
  checkOutTime: string,
): string => {
  const diffMs =
    new Date(checkOutTime).getTime() - new Date(checkInTime).getTime();
  const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} menit`;
  }
  if (minutes === 0) {
    return `${hours} jam`;
  }
  return `${hours} jam ${minutes} menit`;
};

/**
 * Returns the current time as an ISO 8601 string.
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
