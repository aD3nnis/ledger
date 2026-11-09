import { describe, expect, it } from 'vitest'
import seedJson from './transactions.json'
import { parseTransactions } from './seed'

const good = { id: 't1', date: '2026-10-01', merchant: 'Acme', status: 'processed', amountCents: 100, feeCents: 3, surchargeCents: 0 }

describe('parseTransactions (data edge)', () => {
  it('accepts the seed file', () => {
    expect(parseTransactions(seedJson).length).toBeGreaterThanOrEqual(25)
  })

  it('rejects a record with an unknown status, naming the record', () => {
    expect(() => parseTransactions([{ ...good, status: 'settled' }])).toThrow(/t1.*status/)
  })

  it('rejects money that is not integer cents', () => {
    expect(() => parseTransactions([{ ...good, amountCents: 12.5 }])).toThrow(/t1.*amountCents/)
  })

  it('rejects data that is not a list', () => {
    expect(() => parseTransactions({})).toThrow(/list/)
  })
})
