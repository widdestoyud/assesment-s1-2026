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
 * Format a numeric string with Indonesian thousands separator (dot).
 * Example: formatThousands("10000") → "10.000"
 * Non-numeric characters are stripped before formatting.
 */
export const formatThousands = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits === '') return '';
  let formatted = '';
  let count = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      formatted = '.' + formatted;
    }
    formatted = digits[i] + formatted;
    count++;
  }
  return formatted;
};

/**
 * Strip thousands separator (dot) from formatted string to get raw numeric string.
 * Example: stripThousands("10.000") → "10000"
 */
export const stripThousands = (value: string): string => {
  return value.replaceAll('.', '');
};

/**
 * Format a Date or ISO string to Indonesian date-time with colon time separator.
 * Output: "21/5/2026, 10:40:47" (not "10.40.47" which is default id-ID)
 *
 * Indonesian locale uses dot for time separator — we replace with colon.
 */
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = d.toLocaleDateString('id-ID');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${dateStr}, ${hours}:${minutes}:${seconds}`;
};
