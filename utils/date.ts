/**
 * Date helpers pinned to Asia/Phnom_Penh (UTC+7, no DST).
 * Used by the frontend to compute default filter values.
 */

const TZ = 'Asia/Phnom_Penh'

/**
 * Returns today's date as YYYY-MM-DD in Phnom Penh time.
 */
export function todayPP(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: TZ }) // sv-SE gives YYYY-MM-DD
}

/**
 * Returns the current month as YYYY-MM in Phnom Penh time.
 */
export function thisMonthPP(): string {
  return todayPP().substring(0, 7)
}

/**
 * Format a YYYY-MM-DD date string for display.
 * e.g. "2026-11-03" → "03 Nov 2026"
 */
export function formatDate(yyyymmdd: string): string {
  // Parse as UTC midnight to avoid timezone shift on display
  const [y, m, d] = yyyymmdd.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Format a YYYY-MM month string for display.
 * e.g. "2026-11" → "November 2026"
 */
export function formatMonth(yyyymm: string): string {
  const [y, m] = yyyymm.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, 1))
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/**
 * Returns a human-readable label for the active period.
 * e.g. "Today · 03 Nov 2026" or "November 2026"
 */
export function periodLabel(mode: 'daily' | 'monthly', date: string): string {
  if (mode === 'daily') {
    const today = todayPP()
    const prefix = date === today ? 'Today · ' : ''
    return prefix + formatDate(date)
  }
  return formatMonth(date)
}
