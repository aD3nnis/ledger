import { expect, test, type Locator, type Page } from '@playwright/test'
import seedJson from '../src/data/transactions.json' with { type: 'json' }

/*
 * Test oracle: everything below is computed here, straight from the seed JSON, with code written
 * for the test. It deliberately does not import the app's domain functions, so a bug there can't
 * make the app and the test agree on a wrong answer (review finding 2).
 */
interface SeedRow {
  id: string
  date: string
  status: string
  amountCents: number
  feeCents: number
  surchargeCents: number
}
const SEED = seedJson as SeedRow[]
const PAGE_SIZE = 10
const EVIDENCE = 'docs/build-log/0001-transactions-summary'

interface Oracle {
  status?: string
  from?: string
  to?: string
  minCents?: number
  maxCents?: number
}

function expectedRows(f: Oracle): SeedRow[] {
  return SEED.filter(
    (t) =>
      (f.status === undefined || t.status === f.status) &&
      (f.from === undefined || t.date >= f.from) &&
      (f.to === undefined || t.date <= f.to) &&
      (f.minCents === undefined || t.amountCents >= f.minCents) &&
      (f.maxCents === undefined || t.amountCents <= f.maxCents),
  )
}

const dollars = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function expectedSummary(f: Oracle) {
  const processed = expectedRows(f).filter((t) => t.status === 'processed')
  const sum = (pick: (t: SeedRow) => number) => processed.reduce((acc, t) => acc + pick(t), 0)
  return {
    'Processed total': dollars(sum((t) => t.amountCents + t.surchargeCents)),
    'Total fees': dollars(sum((t) => t.feeCents)),
    'Total surcharge': dollars(sum((t) => t.surchargeCents)),
    'Processed count': String(processed.length),
  }
}

const table = (page: Page) => page.getByRole('table', { name: 'Transactions' })
const bodyRows = (page: Page) => table(page).locator('tbody tr')
const summary = (page: Page) => page.getByRole('region', { name: 'Summary' })
const pagination = (page: Page) => page.getByRole('navigation', { name: 'Pagination' })
const groupError = (page: Page, group: 'Amount' | 'Date'): Locator => page.getByRole('group', { name: group }).locator('.error')

async function rowDates(page: Page): Promise<string[]> {
  return bodyRows(page).locator('td:first-child').allInnerTexts()
}

async function expectSummary(page: Page, f: Oracle) {
  for (const [label, value] of Object.entries(expectedSummary(f))) {
    await expect(summary(page).getByLabel(label)).toHaveText(value)
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('paginates 10 per page', async ({ page }) => {
  const total = SEED.length
  const pageCount = Math.ceil(total / PAGE_SIZE)
  expect(total).toBeGreaterThanOrEqual(25) // SPEC-0001: seed has at least 25 rows

  const seen: string[] = []
  for (let p = 1; p <= pageCount; p++) {
    await expect(pagination(page)).toContainText(`Page ${String(p)} of ${String(pageCount)}`)
    await expect(bodyRows(page)).toHaveCount(Math.min(PAGE_SIZE, total - (p - 1) * PAGE_SIZE))
    seen.push(...(await rowDates(page)))
    if (p < pageCount) await pagination(page).getByRole('button', { name: 'Next' }).click()
  }
  await expect(pagination(page).getByRole('button', { name: 'Next' })).toBeDisabled()

  // Every transaction appears exactly once, and dates never increase down the list: newest first.
  expect(seen).toHaveLength(total)
  expect([...seen].sort()).toEqual(SEED.map((t) => t.date).sort())
  seen.forEach((date, i) => {
    if (i > 0) expect(date <= (seen[i - 1] ?? date), `row ${String(i + 1)} is newer than the row above`).toBe(true)
  })

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
  await expectSummary(page, { status: 'processed', minCents: 2500, from: '2026-10-01' })
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
  await expectSummary(page, { status: 'processed', minCents: 10000 })
  const summaryBefore = await summary(page).innerText()
  const rowsBefore = await bodyRows(page).allInnerTexts()

  await page.getByLabel('Maximum amount').fill('25')

  await expect(groupError(page, 'Amount')).toBeVisible()
  await expect(groupError(page, 'Amount')).toHaveText("Minimum amount can't be more than maximum")
  await expect(page.getByLabel('Maximum amount')).toHaveAttribute('aria-invalid', 'true')
  expect(await summary(page).innerText()).toBe(summaryBefore)
  expect(await bodyRows(page).allInnerTexts()).toEqual(rowsBefore)
  await page.screenshot({ path: `${EVIDENCE}/invalid-amount-range.png`, fullPage: true })

  // Fixing the input clears the error and applies the filter.
  await page.getByLabel('Maximum amount').fill('200')
  await expect(groupError(page, 'Amount')).toHaveCount(0)
  await expectSummary(page, { status: 'processed', minCents: 10000, maxCents: 20000 })
})

test('invalid date range shows error', async ({ page }) => {
  await page.getByLabel('From date').fill('2026-10-31')
  await expectSummary(page, { from: '2026-10-31' })
  const summaryBefore = await summary(page).innerText()
  const rowsBefore = await bodyRows(page).allInnerTexts()

  await page.getByLabel('To date').fill('2026-10-01')

  await expect(groupError(page, 'Date')).toBeVisible()
  await expect(groupError(page, 'Date')).toHaveText("To date can't be before from date")
  await expect(page.getByLabel('To date')).toHaveAttribute('aria-invalid', 'true')
  expect(await summary(page).innerText()).toBe(summaryBefore)
  expect(await bodyRows(page).allInnerTexts()).toEqual(rowsBefore)
})

test('a date that does not exist shows an error', async ({ page }) => {
  await page.getByLabel('From date').fill('2026-02-30')
  await expect(groupError(page, 'Date')).toBeVisible()
  await expect(groupError(page, 'Date')).toHaveText("From date isn't a real date (use YYYY-MM-DD)")
  await expect(bodyRows(page)).toHaveCount(PAGE_SIZE) // list unchanged: still the unfiltered first page
})
