import type { Transaction } from '../domain/transaction'

/** Checks untyped JSON at the edge and returns typed transactions; throws naming the bad record. */
export function parseTransactions(_data: unknown): Transaction[] {
  throw new Error('not implemented')
}
