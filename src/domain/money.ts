export type ParseDollarsResult = { ok: true; cents: number } | { ok: false; error: string }

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** Formats integer cents as US dollars, e.g. 123456 → "$1,234.56". Display only. */
export function formatCents(cents: number): string {
  return usd.format(cents / 100)
}

/**
 * Parses a dollar amount typed by a user (e.g. "25", "25.50") into integer cents.
 * Uses string arithmetic, not floats, so "19.99" is exactly 1999.
 */
export function parseDollars(text: string): ParseDollarsResult {
  const value = text.trim()
  if (value.startsWith('-')) return { ok: false, error: "can't be negative" }
  const match = /^(\d+)(?:\.(\d+))?$/.exec(value)
  if (!match) return { ok: false, error: 'must be a number, like 25 or 25.50' }
  const [, whole = '0', fraction = ''] = match
  if (fraction.length > 2) return { ok: false, error: 'can have at most 2 decimal places' }
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  if (!Number.isSafeInteger(cents)) return { ok: false, error: 'is too large' }
  return { ok: true, cents }
}
