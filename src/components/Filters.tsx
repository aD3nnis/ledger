import type { FilterErrors, RawFilters, StatusFilter } from '../domain/filters'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'processed', label: 'Processed' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
]

interface FiltersProps {
  value: RawFilters
  errors: FilterErrors
  onChange: (next: RawFilters) => void
}

/** Filter inputs exactly as typed; each group shows its own error next to its inputs (SPEC-0001). */
export function Filters({ value, errors, onChange }: FiltersProps) {
  const set = (patch: Partial<RawFilters>) => {
    onChange({ ...value, ...patch })
  }
  const amountInvalid = errors.amount !== undefined
  const dateInvalid = errors.date !== undefined

  return (
    <form
      className="filters"
      aria-label="Filters"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <div className="field">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={value.status}
          onChange={(e) => {
            set({ status: e.target.value as StatusFilter })
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className={dateInvalid ? 'invalid' : undefined}>
        <legend>Date</legend>
        <div className="field">
          <label htmlFor="from">From date</label>
          <input
            id="from"
            type="text"
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            autoComplete="off"
            value={value.from}
            aria-invalid={dateInvalid}
            aria-describedby={dateInvalid ? 'date-error' : undefined}
            onChange={(e) => {
              set({ from: e.target.value })
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="to">To date</label>
          <input
            id="to"
            type="text"
            inputMode="numeric"
            placeholder="YYYY-MM-DD"
            autoComplete="off"
            value={value.to}
            aria-invalid={dateInvalid}
            aria-describedby={dateInvalid ? 'date-error' : undefined}
            onChange={(e) => {
              set({ to: e.target.value })
            }}
          />
        </div>
        {/* Polite live region, always rendered so screen readers announce changes without interrupting typing. */}
        <div className="error-slot" aria-live="polite">
          {dateInvalid && (
            <p id="date-error" className="error">
              {errors.date}
            </p>
          )}
        </div>
      </fieldset>

      <fieldset className={amountInvalid ? 'invalid' : undefined}>
        <legend>Amount</legend>
        <div className="field">
          <label htmlFor="min">Minimum amount</label>
          <input
            id="min"
            type="text"
            inputMode="decimal"
            placeholder="$ any"
            value={value.min}
            aria-invalid={amountInvalid}
            aria-describedby={amountInvalid ? 'amount-error' : undefined}
            onChange={(e) => {
              set({ min: e.target.value })
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="max">Maximum amount</label>
          <input
            id="max"
            type="text"
            inputMode="decimal"
            placeholder="$ any"
            value={value.max}
            aria-invalid={amountInvalid}
            aria-describedby={amountInvalid ? 'amount-error' : undefined}
            onChange={(e) => {
              set({ max: e.target.value })
            }}
          />
        </div>
        {/* Polite live region, always rendered so screen readers announce changes without interrupting typing. */}
        <div className="error-slot" aria-live="polite">
          {amountInvalid && (
            <p id="amount-error" className="error">
              {errors.amount}
            </p>
          )}
        </div>
      </fieldset>
    </form>
  )
}
