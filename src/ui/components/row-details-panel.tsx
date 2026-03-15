import { Card, CardContent } from '@/components/ui/card'
import type { LogRow } from '@/domain/log-dataset/entities/log-row'
import { uiTestIds } from '@/ui/test-ids'
import { JsonView, collapseAllNested, defaultStyles } from 'react-json-view-lite'
import 'react-json-view-lite/dist/index.css'

type RowDetailsPanelProps = {
  row: LogRow | null
}

const jsonViewerStyles = {
  ...defaultStyles,
  container:
    'm-0 rounded-lg p-3 font-mono text-xs leading-6 text-foreground',
  childFieldsContainer: 'm-0 pl-4',
  basicChildStyle: 'list-none',
  label: 'text-muted-foreground',
  stringValue: 'text-primary',
  numberValue: 'text-foreground',
  booleanValue: 'text-foreground',
  punctuation: 'text-muted-foreground',
  collapseIcon: `${withoutDefaultMarker(defaultStyles.collapseIcon)} inline-block w-4 text-center text-muted-foreground after:content-['-']`,
  expandIcon: `${withoutDefaultMarker(defaultStyles.expandIcon)} inline-block w-4 text-center text-muted-foreground after:content-['+']`,
  collapsedContent: 'text-muted-foreground italic',
} satisfies typeof defaultStyles

export function RowDetailsPanel({ row }: RowDetailsPanelProps) {
  return (
    <Card
      className="flex h-full min-h-0 w-full flex-col overflow-hidden"
      data-testid={uiTestIds.rowDetailsPanel}
    >
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-auto px-0 pb-0 pt-0">
        {row ? (
          <section className="min-h-0 flex-1 space-y-2 p-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Payload
            </p>
            {renderPayload(row.payload)}
          </section>
        ) : (
          <div className="rounded-lg px-3 py-4 text-sm text-muted-foreground">
            Select a visible row to inspect its payload.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function renderPayload(payload: unknown) {
  if (payload === undefined) {
    return (
      <div className="rounded-lg px-3 py-3 text-sm text-muted-foreground">
        This row does not include a payload.
      </div>
    )
  }

  if (payload === null || typeof payload !== 'object') {
    return (
      <pre className="min-h-0 overflow-auto rounded-lg p-3 font-mono text-xs leading-6 text-foreground">
        {JSON.stringify(payload, null, 2)}
      </pre>
    )
  }

  return (
    <div className="min-h-0 overflow-auto" data-testid={uiTestIds.payloadJsonViewer}>
      <JsonView
        data={payload as Record<string, unknown> | Array<unknown>}
        clickToExpandNode
        shouldExpandNode={collapseAllNested}
        style={jsonViewerStyles}
      />
    </div>
  )
}

function withoutDefaultMarker(className: string) {
  return className.split(' ').slice(0, -1).join(' ')
}
