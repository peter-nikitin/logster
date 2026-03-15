import { expect, test } from '@playwright/test'
import path from 'node:path'
import { uiTestIds } from '../../src/ui/test-ids'

const validLogFile = path.resolve(process.cwd(), 'tests/fixtures/valid-log.json')

test('deletes a stored dataset and removes it after reload', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId(uiTestIds.uploadInput).setInputFiles(validLogFile)
  await expect(page.getByText('valid-log.json')).toBeVisible()

  await page.getByTestId(uiTestIds.storedDatasetDeleteButton).click()
  await expect(page.getByText('valid-log.json')).not.toBeVisible()

  await page.reload()

  await expect(page.getByText('valid-log.json')).not.toBeVisible()
})
