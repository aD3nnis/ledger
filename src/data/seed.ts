import { STATUSES, type Status, type Transaction } from '../domain/transaction'
import { isCalendarDate } from '../domain/filters'
import seedJson from './transactions.json'

const MONEY_FIELDS = ['amountCents', 'feeCents', 'surchargeCents'] as const

function isStatus(value: unknown): value is Status {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value)
}

/** Checks untyped JSON at the edge and returns typed transactions; throws naming the bad record. */
export function parseTransactions(data: unknown): Transaction[] {
  if (!Array.isArray(data)) throw new Error('Seed data must be a list of transactions')
  return data.map((item: unknown, index): Transaction => {
    if (typeof item !== 'object' || item === null) throw new Error(`Transaction #${String(index)} is not an object`)
    const r = item as Record<string, unknown>
    const id = typeof r.id === 'string' ? r.id : `#${String(index)}`
    const fail = (field: string): never => {
      throw new Error(`Transaction ${id}: invalid ${field} (${JSON.stringify(r[field])})`)
    }
    if (typeof r.id !== 'string' || r.id === '') fail('id')
    if (typeof r.date !== 'string' || !isCalendarDate(r.date)) fail('date')
    if (typeof r.merchant !== 'string') fail('merchant')
    if (!isStatus(r.status)) fail('status')
    for (const field of MONEY_FIELDS) {
      const value = r[field]
      if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) fail(field)
    }
    return {
      id: r.id as string,
      date: r.date as string,
      merchant: r.merchant as string,
      status: r.status as Status,
      amountCents: r.amountCents as number,
      feeCents: r.feeCents as number,
      surchargeCents: r.surchargeCents as number,
    }
  })
}

/** The seed transactions, validated once at load. */
export const SEED_TRANSACTIONS: readonly Transaction[] = parseTransactions(seedJson)
