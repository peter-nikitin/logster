import { expect, test } from '@playwright/test'
import path from 'node:path'
import { uiTestIds } from '../../src/ui/test-ids'

const validLogFile = path.resolve(process.cwd(), 'tests/fixtures/valid-log.json')

test('filters by method and text, then shows payload details for the selected row', async ({
  page,
}) => {
  await page.goto('/')

  await page.getByTestId(uiTestIds.uploadInput).setInputFiles(validLogFile)
  await page.getByTestId(uiTestIds.filtersPanelToggle).click()

  await page
    .getByTestId(uiTestIds.filterMethodExpand('[page-chat-metrics]'))
    .click()
  await page
    .getByTestId(
      uiTestIds.filterMessageCheckbox('[page-chat-metrics]', 'logTime'),
    )
    .click()
  await page
    .getByTestId(
      uiTestIds.filterMessageCheckbox('[page-chat-metrics]', 'startSession'),
    )
    .click()
  await expect(page.getByTestId(uiTestIds.datasetRow)).toHaveCount(2)

  await page
    .getByTestId(
      uiTestIds.filterMessageCheckbox('[page-chat-metrics]', 'QuestionsStateSet'),
    )
    .click()
  await expect(page.getByTestId(uiTestIds.datasetRow)).toHaveCount(1)

  await page.getByTestId(uiTestIds.datasetRow).first().click()

  await expect(page.getByTestId(uiTestIds.rowDetailsPanel)).toBeVisible()
  await expect(page.getByTestId(uiTestIds.payloadJsonViewer)).toBeVisible()
  await expect(page.getByText('QuestionsStateSet')).toBeVisible()
})

test('inverts a method facet and removes its rows from the table', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId(uiTestIds.uploadInput).setInputFiles(validLogFile)
  await page.getByTestId(uiTestIds.filtersPanelToggle).click()

  await page
    .getByTestId(uiTestIds.filterMethodInvertButton('[use-tab-content]'))
    .click()

  await expect(page.getByTestId(uiTestIds.datasetRow)).toHaveCount(2)
})
