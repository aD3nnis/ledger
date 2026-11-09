export type ParseDollarsResult = { ok: true; cents: number } | { ok: false; error: string }

/** Formats integer cents as US dollars, e.g. 123456 → "$1,234.56". Display only. */
export function formatCents(_cents: number): string {
  throw new Error('not implemented')
}

/** Parses a dollar amount typed by a user (e.g. "25", "25.50") into integer cents. */
export function parseDollars(_text: string): ParseDollarsResult {
  throw new Error('not implemented')
}
