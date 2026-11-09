import { describe, expect, it } from 'vitest'
import { FIXTURE, txn } from '../test/fixtures'
import { summarize } from './summary'

describe('summarize (SPEC-0001 summary rules)', () => {
  it('processed total includes surcharge, excludes pending and refunded', () => {
    // (1000+100) + (2500+0) + (10000+250); c (pending) and d (refunded) are left out.
    expect(summarize(FIXTURE).processedTotalCents).toBe(13850)
  })

  it('fees, surcharge and count use processed only', () => {
    const s = summarize(FIXTURE)
    expect(s.feeCents).toBe(59 + 103 + 320)
    expect(s.surchargeCents).toBe(100 + 0 + 250)
    expect(s.processedCount).toBe(3)
  })

  it('does not subtract fees from the processed total', () => {
    expect(summarize([txn('x', '2026-10-01', 'processed', 500, 400, 0)]).processedTotalCents).toBe(500)
  })

  it('empty set', () => {
    expect(summarize([])).toEqual({ processedTotalCents: 0, feeCents: 0, surchargeCents: 0, processedCount: 0 })
  })

  it('a set with no processed transactions summarises to zero', () => {
    expect(summarize(FIXTURE.filter((t) => t.status !== 'processed'))).toEqual({
      processedTotalCents: 0,
      feeCents: 0,
      surchargeCents: 0,
      processedCount: 0,
    })
  })
})
