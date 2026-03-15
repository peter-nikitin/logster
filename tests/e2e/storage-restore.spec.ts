import { expect, test } from '@playwright/test'
import path from 'node:path'
import { uiTestIds } from '../../src/ui/test-ids'

const validLogFile = path.resolve(process.cwd(), 'tests/fixtures/valid-log.json')

test('persists and restores uploaded datasets across reloads', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId(uiTestIds.uploadInput).setInputFiles(validLogFile)
  await expect(page.getByText('valid-log.json')).toBeVisible()

  await page.reload()

  await expect(page.getByText('Restoring stored datasets…')).not.toBeVisible()
  await expect(page.getByText('valid-log.json')).toBeVisible()
  await expect(page.getByText('Uploaded')).toBeVisible()
  await expect(page.getByTestId(uiTestIds.datasetTable)).toBeVisible()
})
