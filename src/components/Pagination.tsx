interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

/** Previous/next controls; hidden when there is nothing to page through. */
export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount === 0) return null
  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => {
          onPageChange(page - 1)
        }}
      >
        Previous
      </button>
      <span aria-live="polite">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => {
          onPageChange(page + 1)
        }}
      >
        Next
      </button>
    </nav>
  )
}
