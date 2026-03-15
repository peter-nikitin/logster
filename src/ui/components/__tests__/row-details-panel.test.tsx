/** @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RowDetailsPanel } from '@/ui/components/row-details-panel'
import { uiTestIds } from '@/ui/test-ids'

describe('RowDetailsPanel', () => {
  it('renders metadata and a collapsible payload viewer for nested payloads', () => {
    render(
      <RowDetailsPanel
        row={{
          id: 'row-1',
          timestamp: 1773330778825,
          method: '[use-tab-content]',
          message: 'component mounted',
          deltaMs: 28,
          payload: {
            flags: {
              alpha: '1',
            },
          },
        }}
      />,
    )

    expect(screen.getByTestId(uiTestIds.rowDetailsPanel)).toBeVisible()
    expect(screen.getByText('Payload')).toBeVisible()
    expect(screen.getByTestId(uiTestIds.payloadJsonViewer)).toBeVisible()
    expect(screen.getByLabelText('collapse JSON')).toBeVisible()

    fireEvent.click(screen.getByLabelText('collapse JSON'))

    expect(screen.getByLabelText('expand JSON')).toBeVisible()
  })

  it('shows an empty prompt when no row is selected', () => {
    render(<RowDetailsPanel row={null} />)

    expect(screen.getByText('Select a visible row to inspect its payload.')).toBeVisible()
  })
})
