import { describe, expect, it } from 'vitest'
import { formatCents, parseDollars } from './money'

describe('formatCents', () => {
  it('formats cents as US dollars', () => {
    expect(formatCents(123456)).toBe('$1,234.56')
    expect(formatCents(0)).toBe('$0.00')
    expect(formatCents(5)).toBe('$0.05')
  })
})

describe('parseDollars', () => {
  it('parses whole and decimal dollars into integer cents', () => {
    expect(parseDollars('25')).toEqual({ ok: true, cents: 2500 })
    expect(parseDollars('25.5')).toEqual({ ok: true, cents: 2550 })
    expect(parseDollars('25.50')).toEqual({ ok: true, cents: 2550 })
    expect(parseDollars('0.01')).toEqual({ ok: true, cents: 1 })
    expect(parseDollars('19.99')).toEqual({ ok: true, cents: 1999 })
  })

  it('rejects text that is not a plain number', () => {
    for (const bad of ['abc', '', '1e3', '12,50', '$5', '.5.', '5.']) {
      expect(parseDollars(bad).ok, bad).toBe(false)
    }
  })

  it('rejects negatives and more than 2 decimal places', () => {
    expect(parseDollars('-1').ok).toBe(false)
    expect(parseDollars('1.001').ok).toBe(false)
  })
})
