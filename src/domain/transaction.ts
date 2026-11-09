/** Transaction statuses (SPEC-0001, Known › Scope and data). */
export const STATUSES = ['processed', 'pending', 'refunded'] as const
export type Status = (typeof STATUSES)[number]

/** One transaction. All money is integer cents (SPEC-0001). Dates are `YYYY-MM-DD`. */
export interface Transaction {
  id: string
  date: string
  merchant: string
  status: Status
  amountCents: number
  feeCents: number
  surchargeCents: number
}
