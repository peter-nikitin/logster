/** @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DatasetFiltersPanel } from '@/ui/components/dataset-filters-panel'
import { uiTestIds } from '@/ui/test-ids'

describe('DatasetFiltersPanel', () => {
  it('renders a drill-down tree and forwards checkbox, invert, and expand actions', () => {
    const onMethodIncludedChange = vi.fn()
    const onMethodExcludeToggle = vi.fn()
    const onMessageIncludedChange = vi.fn()
    const onMessageExcludeToggle = vi.fn()
    const onMethodExpandedToggle = vi.fn()
    const onClearFilters = vi.fn()

    render(
      <DatasetFiltersPanel
        isDisabled={false}
        methods={[
          {
            method: '[alpha]',
            rowCount: 2,
            messages: [{ message: 'special trace', rowCount: 1 }],
          },
        ]}
        includedMethods={['[alpha]']}
        excludedMethods={[]}
        includedMessages={[]}
        excludedMessages={[]}
        expandedMethods={['[alpha]']}
        totalCount={3}
        visibleCount={1}
        onMethodIncludedChange={onMethodIncludedChange}
        onMethodExcludeToggle={onMethodExcludeToggle}
        onMessageIncludedChange={onMessageIncludedChange}
        onMessageExcludeToggle={onMessageExcludeToggle}
        onMethodExpandedToggle={onMethodExpandedToggle}
        onClearFilters={onClearFilters}
      />,
    )

    fireEvent.click(screen.getByTestId(uiTestIds.filterMethodCheckbox('[alpha]')))
    fireEvent.click(screen.getByTestId(uiTestIds.filterMethodInvertButton('[alpha]')))
    fireEvent.click(screen.getByTestId(uiTestIds.filterMethodExpand('[alpha]')))
    fireEvent.click(
      screen.getByTestId(
        uiTestIds.filterMessageCheckbox('[alpha]', 'special trace'),
      ),
    )
    fireEvent.click(
      screen.getByTestId(
        uiTestIds.filterMessageInvertButton('[alpha]', 'special trace'),
      ),
    )
    fireEvent.click(screen.getByText('Clear'))

    expect(onMethodIncludedChange).toHaveBeenCalledWith('[alpha]', false)
    expect(onMethodExcludeToggle).toHaveBeenCalledWith('[alpha]')
    expect(onMethodExpandedToggle).toHaveBeenCalledWith('[alpha]')
    expect(onMessageIncludedChange).toHaveBeenCalledWith(
      {
        method: '[alpha]',
        message: 'special trace',
      },
      false,
      ['special trace'],
    )
    expect(onMessageExcludeToggle).toHaveBeenCalledWith({
      method: '[alpha]',
      message: 'special trace',
    })
    expect(onClearFilters).toHaveBeenCalledOnce()
    expect(screen.getByText('1 / 3')).toBeVisible()
  })

  it('shows a dataset prompt when disabled', () => {
    render(
      <DatasetFiltersPanel
        isDisabled
        methods={[]}
        includedMethods={[]}
        excludedMethods={[]}
        includedMessages={[]}
        excludedMessages={[]}
        expandedMethods={[]}
        totalCount={0}
        visibleCount={0}
        onMethodIncludedChange={vi.fn()}
        onMethodExcludeToggle={vi.fn()}
        onMessageIncludedChange={vi.fn()}
        onMessageExcludeToggle={vi.fn()}
        onMethodExpandedToggle={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Open a dataset to inspect methods and drill into nested log texts.'),
    ).toBeVisible()
  })
})
