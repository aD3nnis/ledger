export const PAGE_SIZE = 10

export interface Page<T> {
  rows: T[]
  /** 1-based, clamped to the pages that exist. */
  page: number
  /** 0 when there are no items. */
  pageCount: number
}

export function paginate<T>(_items: readonly T[], _page: number, _size: number = PAGE_SIZE): Page<T> {
  throw new Error('not implemented')
}
