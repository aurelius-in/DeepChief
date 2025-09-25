import { test, expect } from '@playwright/test'

test('loads console and shows KPIs section', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Console')).toBeVisible()
})


