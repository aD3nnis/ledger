export const PAGE_SIZE = 10

export interface Page<T> {
  rows: T[]
  /** 1-based, clamped to the pages that exist. */
  page: number
  /** 0 when there are no items. */
  pageCount: number
}

export function paginate<T>(items: readonly T[], page: number, size: number = PAGE_SIZE): Page<T> {
  const pageCount = Math.ceil(items.length / size)
  const current = Math.min(Math.max(1, page), Math.max(1, pageCount))
  const start = (current - 1) * size
  return { rows: items.slice(start, start + size), page: current, pageCount }
}
