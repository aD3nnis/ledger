import { describe, expect, it } from 'vitest'
import { FIXTURE, ids, txn } from '../test/fixtures'
import { applyFilters, EMPTY_FILTERS, sortNewestFirst, validateFilters, type RawFilters } from './filters'

const raw = (patch: Partial<RawFilters>): RawFilters => ({ ...EMPTY_FILTERS, ...patch })

function errorsFor(patch: Partial<RawFilters>) {
  const result = validateFilters(raw(patch))
  if (result.ok) throw new Error(`expected invalid, got criteria ${JSON.stringify(result.criteria)}`)
  return result.errors
}

function criteriaFor(patch: Partial<RawFilters>) {
  const result = validateFilters(raw(patch))
  if (!result.ok) throw new Error(`expected valid, got errors ${JSON.stringify(result.errors)}`)
  return result.criteria
}

describe('validateFilters: invalid input (SPEC-0001 › Invalid filter input)', () => {
  it('rejects min amount greater than max', () => {
    expect(errorsFor({ min: '100', max: '25' }).amount).toBe("Minimum amount can't be more than maximum")
  })

  it('rejects a negative min amount', () => {
    expect(errorsFor({ min: '-5' }).amount).toBe("Minimum amount can't be negative")
  })

  it('rejects a negative max amount', () => {
    expect(errorsFor({ max: '-0.01' }).amount).toBe("Maximum amount can't be negative")
  })

  it('rejects an amount that is not a number', () => {
    expect(errorsFor({ min: 'abc' }).amount).toBe('Minimum amount must be a number, like 25 or 25.50')
    expect(errorsFor({ max: '12x' }).amount).toBe('Maximum amount must be a number, like 25 or 25.50')
  })

  it('rejects an amount with more than 2 decimal places', () => {
    expect(errorsFor({ min: '12.345' }).amount).toBe('Minimum amount can have at most 2 decimal places')
  })

  it('rejects a to date before the from date', () => {
    expect(errorsFor({ from: '2026-10-31', to: '2026-10-01' }).date).toBe("To date can't be before from date")
  })

  it('rejects a date that is not a real calendar date', () => {
    expect(errorsFor({ from: '2026-02-30' }).date).toBe("From date isn't a real date (use YYYY-MM-DD)")
    expect(errorsFor({ to: '2026-13-01' }).date).toBe("To date isn't a real date (use YYYY-MM-DD)")
    expect(errorsFor({ from: 'yesterday' }).date).toBe("From date isn't a real date (use YYYY-MM-DD)")
  })

  it('reports an amount error and a date error together', () => {
    const errors = errorsFor({ min: '100', max: '25', from: '2026-10-31', to: '2026-10-01' })
    expect(errors.amount).toBeDefined()
    expect(errors.date).toBeDefined()
  })
})

describe('validateFilters: valid input', () => {
  it('treats empty bounds as unbounded', () => {
    expect(criteriaFor({})).toEqual({ status: 'all' })
  })

  it('converts dollar bounds to cents and accepts equal bounds', () => {
    expect(criteriaFor({ min: '25', max: '25.00' })).toMatchObject({ minCents: 2500, maxCents: 2500 })
    expect(criteriaFor({ from: '2026-10-01', to: '2026-10-01' })).toMatchObject({ from: '2026-10-01', to: '2026-10-01' })
  })

  it('ignores surrounding spaces', () => {
    expect(criteriaFor({ min: ' 25 ', from: ' 2026-10-01 ' })).toMatchObject({ minCents: 2500, from: '2026-10-01' })
  })
})

describe('applyFilters (SPEC-0001 › List and filters)', () => {
  it('applies the status filter', () => {
    expect(ids(applyFilters(FIXTURE, criteriaFor({ status: 'processed' })))).toEqual(['a', 'b', 'e'])
    expect(ids(applyFilters(FIXTURE, criteriaFor({ status: 'refunded' })))).toEqual(['d'])
  })

  it('applies the date range with inclusive bounds', () => {
    expect(ids(applyFilters(FIXTURE, criteriaFor({ from: '2026-10-01', to: '2026-10-31' })))).toEqual(['a', 'b', 'c', 'd'])
  })

  it('applies the amount range with inclusive bounds on amount only, not amount + surcharge', () => {
    // b is exactly 25.00 and d, e exactly 100.00; e's surcharge would push amount + surcharge over 100.
    expect(ids(applyFilters(FIXTURE, criteriaFor({ min: '25', max: '100' })))).toEqual(['b', 'c', 'd', 'e'])
  })

  it('applies one-sided bounds', () => {
    expect(ids(applyFilters(FIXTURE, criteriaFor({ from: '2026-10-31' })))).toEqual(['d', 'e'])
    expect(ids(applyFilters(FIXTURE, criteriaFor({ max: '10' })))).toEqual(['a'])
  })

  it('applies all filters together', () => {
    expect(ids(applyFilters(FIXTURE, criteriaFor({ status: 'processed', min: '25', to: '2026-10-31' })))).toEqual(['b'])
  })

  it('applies no filters when everything is empty', () => {
    expect(ids(applyFilters(FIXTURE, criteriaFor({})))).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})

describe('sortNewestFirst', () => {
  it('orders by date descending, then id descending', () => {
    const list = [txn('p', '2026-10-01', 'pending', 1, 0, 0), txn('r', '2026-11-01', 'pending', 1, 0, 0), txn('q', '2026-10-01', 'pending', 1, 0, 0)]
    expect(ids(sortNewestFirst(list))).toEqual(['r', 'q', 'p'])
  })

  it('does not mutate its input', () => {
    const list = [...FIXTURE]
    sortNewestFirst(list)
    expect(ids(list)).toEqual(ids(FIXTURE))
  })
})
