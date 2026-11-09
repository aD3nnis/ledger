import type { Transaction } from './transaction'

export interface Summary {
  /** Σ (amountCents + surchargeCents) over processed transactions (SPEC-0001). */
  processedTotalCents: number
  feeCents: number
  surchargeCents: number
  processedCount: number
}

export function summarize(_transactions: readonly Transaction[]): Summary {
  throw new Error('not implemented')
}
