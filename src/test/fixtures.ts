import type { Status, Transaction } from '../domain/transaction'

export function txn(
  id: string,
  date: string,
  status: Status,
  amountCents: number,
  feeCents: number,
  surchargeCents: number,
): Transaction {
  return { id, date, merchant: `Merchant ${id}`, status, amountCents, feeCents, surchargeCents }
}

/**
 * Five transactions with totals you can check by hand.
 * Processed: a, b, e → total (1000+100) + (2500+0) + (10000+250) = 13850; fees 59+103+320 = 482;
 * surcharge 100+0+250 = 350; count 3.
 */
export const FIXTURE: Transaction[] = [
  txn('a', '2026-10-01', 'processed', 1000, 59, 100),
  txn('b', '2026-10-15', 'processed', 2500, 103, 0),
  txn('c', '2026-10-20', 'pending', 4000, 146, 250),
  txn('d', '2026-10-31', 'refunded', 10000, 320, 150),
  txn('e', '2026-11-02', 'processed', 10000, 320, 250),
]

export const ids = (transactions: readonly Transaction[]): string[] => transactions.map((t) => t.id)
