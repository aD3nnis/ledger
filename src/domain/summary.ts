import type { Transaction } from './transaction'

export interface Summary {
  /** Σ (amountCents + surchargeCents) over processed transactions (SPEC-0001). */
  processedTotalCents: number
  feeCents: number
  surchargeCents: number
  processedCount: number
}

/** Summarises processed transactions only; pending and refunded are excluded (SPEC-0001). */
export function summarize(transactions: readonly Transaction[]): Summary {
  const summary: Summary = { processedTotalCents: 0, feeCents: 0, surchargeCents: 0, processedCount: 0 }
  for (const t of transactions) {
    if (t.status !== 'processed') continue
    summary.processedTotalCents += t.amountCents + t.surchargeCents
    summary.feeCents += t.feeCents
    summary.surchargeCents += t.surchargeCents
    summary.processedCount += 1
  }
  return summary
}
