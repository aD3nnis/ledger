import { formatCents } from '../domain/money'
import type { Transaction } from '../domain/transaction'

export function TransactionTable({ rows }: { rows: readonly Transaction[] }) {
  if (rows.length === 0) {
    return <p className="empty">No transactions match these filters</p>
  }
  return (
    <table>
      <caption>Transactions</caption>
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Merchant</th>
          <th scope="col">Status</th>
          <th scope="col" className="num">Amount</th>
          <th scope="col" className="num">Fee</th>
          <th scope="col" className="num">Surcharge</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.id}>
            <td>{t.date}</td>
            <td>{t.merchant}</td>
            <td>
              <span className={`status status-${t.status}`}>{t.status}</span>
            </td>
            <td className="num">{formatCents(t.amountCents)}</td>
            <td className="num">{formatCents(t.feeCents)}</td>
            <td className="num">{formatCents(t.surchargeCents)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
