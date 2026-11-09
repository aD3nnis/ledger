import { describe, expect, it } from 'vitest'
import { paginate } from './paginate'

const items = Array.from({ length: 25 }, (_, i) => i + 1)

describe('paginate (SPEC-0001: 10 per page)', () => {
  it('returns 10 rows per page by default', () => {
    expect(paginate(items, 1)).toEqual({ rows: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], page: 1, pageCount: 3 })
    expect(paginate(items, 3)).toEqual({ rows: [21, 22, 23, 24, 25], page: 3, pageCount: 3 })
  })

  it('clamps the page to the pages that exist', () => {
    expect(paginate(items, 9).page).toBe(3)
    expect(paginate(items, 0).page).toBe(1)
  })

  it('handles an empty list', () => {
    expect(paginate([], 1)).toEqual({ rows: [], page: 1, pageCount: 0 })
  })
})
