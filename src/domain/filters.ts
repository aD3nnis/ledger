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

export function validateFilters(_raw: RawFilters): ValidationResult {
  throw new Error('not implemented')
}

export function applyFilters(_transactions: readonly Transaction[], _criteria: Criteria): Transaction[] {
  throw new Error('not implemented')
}

/** Newest date first; ties broken by id, descending, so the order is stable. */
export function sortNewestFirst(_transactions: readonly Transaction[]): Transaction[] {
  throw new Error('not implemented')
}
