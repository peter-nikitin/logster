import { expect, test } from '@playwright/test'
import path from 'node:path'
import { uiTestIds } from '../../src/ui/test-ids'

const validLogFile = path.resolve(process.cwd(), 'tests/fixtures/valid-log.json')
const invalidLogFile = path.resolve(process.cwd(), 'tests/fixtures/invalid-log.json')

test('uploads a valid log and renders it in the table and details view', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId(uiTestIds.uploadInput).setInputFiles(validLogFile)

  await expect(page.getByText('valid-log.json')).toBeVisible()
  await expect(page.getByText('Uploaded')).toBeVisible()
  await expect(page.getByTestId(uiTestIds.datasetTable)).toBeVisible()
  await expect(page.getByTestId(uiTestIds.datasetRow)).toHaveCount(3)

  await page.getByTestId(uiTestIds.datasetRow).nth(1).click()

  await expect(page.getByTestId(uiTestIds.rowDetails)).toBeVisible()
  await expect(page.getByText('component mounted')).toBeVisible()
})

test('shows a readable error for an invalid upload', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId(uiTestIds.uploadInput).setInputFiles(invalidLogFile)

  await expect(page.getByTestId(uiTestIds.errorState)).toBeVisible()
})
