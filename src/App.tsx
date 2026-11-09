import { useMemo, useState } from 'react'
import { Filters } from './components/Filters'
import { Pagination } from './components/Pagination'
import { Summary } from './components/Summary'
import { TransactionTable } from './components/TransactionTable'
import { SEED_TRANSACTIONS } from './data/seed'
import {
  applyFilters,
  EMPTY_FILTERS,
  sortNewestFirst,
  validateFilters,
  type Criteria,
  type FilterErrors,
  type RawFilters,
} from './domain/filters'
import { paginate } from './domain/paginate'
import { summarize } from './domain/summary'

const NEWEST_FIRST = sortNewestFirst(SEED_TRANSACTIONS)

export function App() {
  const [raw, setRaw] = useState<RawFilters>(EMPTY_FILTERS)
  const [errors, setErrors] = useState<FilterErrors>({})
  // The last valid criteria. Invalid input never replaces them, so the list and summary keep their values.
  const [criteria, setCriteria] = useState<Criteria>({ status: 'all' })
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => applyFilters(NEWEST_FIRST, criteria), [criteria])
  const summary = useMemo(() => summarize(filtered), [filtered])
  const current = paginate(filtered, page)

  function handleFiltersChange(next: RawFilters) {
    setRaw(next)
    const result = validateFilters(next)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    setCriteria(result.criteria)
    setPage(1)
  }

  return (
    <main>
      <h1>Transactions</h1>
      <Filters value={raw} errors={errors} onChange={handleFiltersChange} />
      <Summary summary={summary} />
      <TransactionTable rows={current.rows} />
      <Pagination page={current.page} pageCount={current.pageCount} onPageChange={setPage} />
    </main>
  )
}
