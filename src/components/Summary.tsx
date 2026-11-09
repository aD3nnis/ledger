import { formatCents } from '../domain/money'
import type { Summary as SummaryValues } from '../domain/summary'

/** The four summary lines for the filtered set across all pages; processed transactions only (SPEC-0001). */
export function Summary({ summary }: { summary: SummaryValues }) {
  const lines = [
    { id: 'processed-total', label: 'Processed total', value: formatCents(summary.processedTotalCents) },
    { id: 'total-fees', label: 'Total fees', value: formatCents(summary.feeCents) },
    { id: 'total-surcharge', label: 'Total surcharge', value: formatCents(summary.surchargeCents) },
    { id: 'processed-count', label: 'Processed count', value: String(summary.processedCount) },
  ]
  return (
    <section className="summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Summary</h2>
      <p className="hint">Processed transactions matching the filters, across all pages.</p>
      <dl>
        {lines.map((line) => (
          <div key={line.id}>
            <dt id={`${line.id}-label`}>{line.label}</dt>
            <dd aria-labelledby={`${line.id}-label`}>{line.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
