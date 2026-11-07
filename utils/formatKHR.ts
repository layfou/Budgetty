/**
 * Format a KHR amount for display.
 *
 * Rules:
 *  - Thousands separators (commas)
 *  - ៛ symbol after the number
 *  - No decimals
 *  - Negative amounts shown in red via CSS class; this util handles the
 *    string representation: negative = minus sign before the number
 *
 * Examples:
 *  formatKHR(1250000)  → "1,250,000 ៛"
 *  formatKHR(-45000)   → "-45,000 ៛"
 *  formatKHR(0)        → "0 ៛"
 */
export function formatKHR(n: number): string {
  const abs = Math.abs(Math.round(n))
  const formatted = abs.toLocaleString('en-US')
  return (n < 0 ? '-' : '') + formatted + ' ៛'
}
