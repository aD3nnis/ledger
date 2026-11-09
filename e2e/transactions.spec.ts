import { expect, test, type Page } from '@playwright/test'
import { SEED_TRANSACTIONS } from '../src/data/seed'
import { applyFilters, EMPTY_FILTERS, sortNewestFirst, validateFilters, type RawFilters } from '../src/domain/filters'
import { formatCents } from '../src/domain/money'
import { PAGE_SIZE } from '../src/domain/paginate'
import { summarize } from '../src/domain/summary'

const EVIDENCE = 'docs/build-log/0001-transactions-summary'

/** Expected rows for a filter, computed from the seed file with the domain functions (never typed by hand). */
function expectedRows(patch: Partial<RawFilters>) {
  const result = validateFilters({ ...EMPTY_FILTERS, ...patch })
  if (!result.ok) throw new Error('test setup: filters must be valid')
  return sortNewestFirst(applyFilters(SEED_TRANSACTIONS, result.criteria))
}

const table = (page: Page) => page.getByRole('table', { name: 'Transactions' })
const bodyRows = (page: Page) => table(page).locator('tbody tr')
const summary = (page: Page) => page.getByRole('region', { name: 'Summary' })
const pagination = (page: Page) => page.getByRole('navigation', { name: 'Pagination' })

async function rowDates(page: Page): Promise<string[]> {
  return bodyRows(page).locator('td:first-child').allInnerTexts()
}

async function expectSummary(page: Page, patch: Partial<RawFilters>) {
  const s = summarize(expectedRows(patch))
  await expect(summary(page).getByLabel('Processed total')).toHaveText(formatCents(s.processedTotalCents))
  await expect(summary(page).getByLabel('Total fees')).toHaveText(formatCents(s.feeCents))
  await expect(summary(page).getByLabel('Total surcharge')).toHaveText(formatCents(s.surchargeCents))
  await expect(summary(page).getByLabel('Processed count')).toHaveText(String(s.processedCount))
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('paginates 10 per page', async ({ page }) => {
  const all = expectedRows({})
  const pageCount = Math.ceil(all.length / PAGE_SIZE)
  expect(pageCount).toBeGreaterThanOrEqual(3) // seed has at least 25 rows (SPEC-0001)

  for (let p = 1; p <= pageCount; p++) {
    const slice = all.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE)
    await expect(pagination(page)).toContainText(`Page ${String(p)} of ${String(pageCount)}`)
    await expect(bodyRows(page)).toHaveCount(slice.length)
    expect(await rowDates(page)).toEqual(slice.map((t) => t.date)) // newest first
    if (p < pageCount) await pagination(page).getByRole('button', { name: 'Next' }).click()
  }
  await expect(pagination(page).getByRole('button', { name: 'Next' })).toBeDisabled()

  await pagination(page).getByRole('button', { name: 'Previous' }).click()
  await expect(pagination(page)).toContainText(`Page ${String(pageCount - 1)} of ${String(pageCount)}`)

  // A filter change returns to page 1.
  await page.getByLabel('Status').selectOption('processed')
  const processedPages = Math.ceil(expectedRows({ status: 'processed' }).length / PAGE_SIZE)
  await expect(pagination(page)).toContainText(`Page 1 of ${String(processedPages)}`)
})

test('summary follows filters', async ({ page }) => {
  await expectSummary(page, {})

  // Processed spans more than one page; the summary covers all of it, not just the 10 visible rows.
  await page.getByLabel('Status').selectOption('processed')
  expect(expectedRows({ status: 'processed' }).length).toBeGreaterThan(PAGE_SIZE)
  await expectSummary(page, { status: 'processed' })

  await page.getByLabel('Minimum amount').fill('25')
  await page.getByLabel('From date').fill('2026-10-01')
  await expectSummary(page, { status: 'processed', min: '25', from: '2026-10-01' })
  await page.screenshot({ path: `${EVIDENCE}/summary-filtered.png`, fullPage: true })
})

test('empty result', async ({ page }) => {
  await page.getByLabel('From date').fill('2030-01-01')
  await expect(page.getByText('No transactions match these filters')).toBeVisible()
  await expect(bodyRows(page)).toHaveCount(0)
  await expect(summary(page).getByLabel('Processed total')).toHaveText('$0.00')
  await expect(summary(page).getByLabel('Total fees')).toHaveText('$0.00')
  await expect(summary(page).getByLabel('Total surcharge')).toHaveText('$0.00')
  await expect(summary(page).getByLabel('Processed count')).toHaveText('0')
  await expect(pagination(page)).toBeHidden()
})

test('invalid amount range shows error', async ({ page }) => {
  await page.getByLabel('Status').selectOption('processed')
  await page.getByLabel('Minimum amount').fill('100')
  await expectSummary(page, { status: 'processed', min: '100' })
  const summaryBefore = await summary(page).innerText()
  const rowsBefore = await bodyRows(page).allInnerTexts()

  await page.getByLabel('Maximum amount').fill('25')

  const amountGroup = page.getByRole('group', { name: 'Amount' })
  await expect(amountGroup.getByRole('alert')).toHaveText("Minimum amount can't be more than maximum")
  await expect(page.getByLabel('Maximum amount')).toHaveAttribute('aria-invalid', 'true')
  expect(await summary(page).innerText()).toBe(summaryBefore)
  expect(await bodyRows(page).allInnerTexts()).toEqual(rowsBefore)
  await page.screenshot({ path: `${EVIDENCE}/invalid-amount-range.png`, fullPage: true })

  // Fixing the input clears the error and applies the filter.
  await page.getByLabel('Maximum amount').fill('200')
  await expect(amountGroup.getByRole('alert')).toHaveCount(0)
  await expectSummary(page, { status: 'processed', min: '100', max: '200' })
})

test('invalid date range shows error', async ({ page }) => {
  await page.getByLabel('From date').fill('2026-10-31')
  await expectSummary(page, { from: '2026-10-31' })
  const summaryBefore = await summary(page).innerText()
  const rowsBefore = await bodyRows(page).allInnerTexts()

  await page.getByLabel('To date').fill('2026-10-01')

  const dateGroup = page.getByRole('group', { name: 'Date' })
  await expect(dateGroup.getByRole('alert')).toHaveText("To date can't be before from date")
  expect(await summary(page).innerText()).toBe(summaryBefore)
  expect(await bodyRows(page).allInnerTexts()).toEqual(rowsBefore)
})
