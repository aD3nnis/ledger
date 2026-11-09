import { expect, test } from '@playwright/test'

test('app loads with its heading (scaffold smoke test)', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible()
})
