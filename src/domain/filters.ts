import { parseDollars } from './money'
import type { Status, Transaction } from './transaction'

export type StatusFilter = Status | 'all'

/** Filter values exactly as typed in the UI. Empty string = no bound. */
export interface RawFilters {
  status: StatusFilter
  from: string
  to: string
  min: string
  max: string
}

/** Validated filter criteria. Undefined bound = unbounded. Bounds are inclusive. */
export interface Criteria {
  status: StatusFilter
  from?: string
  to?: string
  minCents?: number
  maxCents?: number
}

/** One message per filter group, shown next to that group's inputs. */
export interface FilterErrors {
  amount?: string
  date?: string
}

export type ValidationResult = { ok: true; criteria: Criteria } | { ok: false; errors: FilterErrors }

export const EMPTY_FILTERS: RawFilters = { status: 'all', from: '', to: '', min: '', max: '' }

/** True for a real calendar date written as YYYY-MM-DD (rejects 2026-02-30, 2026-13-01). */
export function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

function validateAmounts(min: string, max: string): { error?: string; minCents?: number; maxCents?: number } {
  const bounds: { minCents?: number; maxCents?: number } = {}
  for (const [label, text, key] of [
    ['Minimum', min.trim(), 'minCents'],
    ['Maximum', max.trim(), 'maxCents'],
  ] as const) {
    if (text === '') continue
    const parsed = parseDollars(text)
    if (!parsed.ok) return { error: `${label} amount ${parsed.error}` }
    bounds[key] = parsed.cents
  }
  if (bounds.minCents !== undefined && bounds.maxCents !== undefined && bounds.minCents > bounds.maxCents) {
    return { error: "Minimum amount can't be more than maximum" }
  }
  return bounds
}

function validateDates(from: string, to: string): { error?: string; from?: string; to?: string } {
  const bounds: { from?: string; to?: string } = {}
  for (const [label, text, key] of [
    ['From', from.trim(), 'from'],
    ['To', to.trim(), 'to'],
  ] as const) {
    if (text === '') continue
    if (!isCalendarDate(text)) return { error: `${label} date isn't a real date (use YYYY-MM-DD)` }
    bounds[key] = text
  }
  // YYYY-MM-DD strings compare correctly as text.
  if (bounds.from !== undefined && bounds.to !== undefined && bounds.to < bounds.from) {
    return { error: "To date can't be before from date" }
  }
  return bounds
}

export function validateFilters(raw: RawFilters): ValidationResult {
  const { error: amountError, ...amounts } = validateAmounts(raw.min, raw.max)
  const { error: dateError, ...dates } = validateDates(raw.from, raw.to)
  if (amountError !== undefined || dateError !== undefined) {
    const errors: FilterErrors = {}
    if (amountError !== undefined) errors.amount = amountError
    if (dateError !== undefined) errors.date = dateError
    return { ok: false, errors }
  }
  return { ok: true, criteria: { status: raw.status, ...dates, ...amounts } }
}

/** Keeps transactions matching every criterion. All bounds are inclusive; amount bounds use amountCents only. */
export function applyFilters(transactions: readonly Transaction[], criteria: Criteria): Transaction[] {
  const { status, from, to, minCents, maxCents } = criteria
  return transactions.filter(
    (t) =>
      (status === 'all' || t.status === status) &&
      (from === undefined || t.date >= from) &&
      (to === undefined || t.date <= to) &&
      (minCents === undefined || t.amountCents >= minCents) &&
      (maxCents === undefined || t.amountCents <= maxCents),
  )
}

/** Newest date first; ties broken by id, descending, so the order is stable. */
export function sortNewestFirst(transactions: readonly Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) =>
    a.date === b.date ? b.id.localeCompare(a.id) : b.date.localeCompare(a.date),
  )
}
